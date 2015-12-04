/*************************************************
--------------------CSS Import--------------------
*************************************************/

[
    "nineSquares.css"
].forEach(function(href){
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
});

/*******************************************
--------------------Main--------------------
*******************************************/

/**
* Append a 9 squares button and a list of icons in the #applications-widget div
* @configArray : JSON file that is used to configure the widget
**/
function startNsWidget(configArray){
    var apps = configArray.apps;
    var services = configArray.services;
    var maxApps = configArray.maxApps;
    var mainIconUrl = configArray.mainIconUrl;
    var loadingIconUrl = configArray.loadingIconUrl;

    // We need maxApps and ajaxCount to be global :/
    window.nswidget = {};
    window.nswidget.maxApps = maxApps;
    window.nswidget.ajaxCount = 0;

    // First we add the 9 squares button, then the block we'll put the apps in. The applications block is not visible at first
    var appButton = '<div class="icon app-button" style="margin-left:500px;background-image: url(\'' + mainIconUrl + '\');"><span class="loader"><img src=\'' + loadingIconUrl + '\' style="display:none;"></span></div>';
    var applications = "<div class=\"applications\" style=\"display:none;\"></div>";
    var applicationsWidget = $("#ns-widget");
    applicationsWidget.append(appButton);
    applicationsWidget.append(applications);
    applications = $("#ns-widget .applications");
    var nbrApps = apps.length;

    // We add a click event on the button : toggle the applications block
    // We also make the applications block disapear if we click outside of it
    appButton = $("#ns-widget .app-button").click(function(){
        applications.toggle(0);
    });
    $(document).on("click", function(event){
        if(!$(event.target).closest(applications).length && !$(event.target).closest(appButton).length && !$(event.target).closest(".plus-button").length){
            applications.hide(0);
        }
    });

    // We put the applications block under the button
    var offset = appButton.offset().left;
    applications.css("margin-left", offset - 183 + 26); // button x coordinate - (applications block size)/2 + (button size/2)
    /*
    // We create the clickable icons with the configuration JSON file
    for(var i=0; i<nbrApps; i++){
        var app = apps[i];
        var appTag = '<a class="vignette" title="'+app.title+'" href="'+app.url+'" ><span class="icon '+app.title.toLowerCase()+'" title="'+app.title+'" style="background-image: url(\''+app.iconUrl+'\');"></span></a>';
        applications.append(appTag);
    }*/
    updateApplications(configArray);
    // We update the size of the applications block
    updateBoxSize(maxApps);
    /*
    //We add special features to the icons if there are services to call/execute in the configuration JSON file
    // TODO : Slef-genereating arrays
    var casServices = [];
    var zimbraServices = [];
    var zcs_personnelServices = [];
    var zcs_etudiantServices = [];
    for(var i = 0; i<services.length; i++){
        var service = services[i];
        var auth = service.auth || null
        if (auth === "casZCS_personnel"){
            zcs_personnelServices.push(service);
        }else if(auth === "casZCS_etudiant"){
            zcs_etudiantServices.push(service);
        }else if(auth === "casZimbra"){
            zimbraServices.push(service);
        }else if(auth === "cas"){
            casServices.push(service);
        }else{
            var refreshTime = service.refreshTime;
            switch(service.name) { // Executes services that don't require authentification
                case "connexion":
                    tryConnexion("img/connexion.png", configArray);
                    console.log(refreshTime);
                    if(refreshTime > 0){ // If the attribute refreshTime exists, we execute the service every refreshTime seconds
                        $(document).ready(function() {
                            setInterval(tryConnexion,refreshTime,'img/connexion.png', configArray);
                        });
                    }
                    break;
                default:
                    console.log("Unknown service");
            }
        }
    }
    if(casServices.length !== 0) authCas("cas", casServices);
    if(zcs_personnelServices.length !== 0) authCas("zcs_personnel", zcs_personnelServices);
    if(zcs_etudiantServices.length !== 0) authCas("zcs_etudiant", zcs_etudiantServices);
    if(zimbraServices.length !== 0) authCas("zimbra", zimbraServices);
    */
}

/***********************************************
--------------------Services--------------------
***********************************************/

/**
* Tries to authentificate the user for a particular service
* /!\ Due to CAS redirections, authentification succedes when the ajax call gets an error /!\
* @authName : String which is the name of the service
* @authServices : JSON object that contains the details of the service. It can be handed to the service function if needed
**/
function authCas(authName, authServices){
    var urlCAS = "";
    if(authName === ""){

    }else if(authName === "zimbra")
        urlCAS = "https://auth.univ-lorraine.fr/login?service=https%3A%2F%2Fmail.univ-lorraine.fr%2Fzimbra%2Fpreauth%2FpreauthUL_PERS.jsp";
    else if(authName === "zcs_personnel")
        urlCAS = "https://auth.univ-lorraine.fr/login?service=https%3A%2F%2Fauth-zcs.univ-lorraine.fr%2Funiv-lorraine.fr.token-json";
    else if(authName === "zcs_etudiant")
        urlCAS = "https://auth.univ-lorraine.fr/login?service=https%3A%2F%2Fauth-zcs.univ-lorraine.fr%2Fetu.univ-lorraine.fr.token-json";
    ajaxPerso(urlCAS,
        function(data){
            console.log("You need to connect to CAS");
        },
        function(){
            for(var i = 0; i < authServices.length; i++){
                var service = authServices[ i ];
                switch(service.name){ // Executes services that have successfuly authentificated
                case "zimbra":
                    var refreshTime = service.refreshTime || 300000;
                    getZimbraData();
                    if(refreshTime > 0){ // If the attribute refreshTime exists, we execute the service every refreshTime seconds
                            $(document).ready(function(){
                                setInterval("getZimbraData()", refreshTime);
                            });
                        }
                    break;
                case "addApps":
                    if(authName === "zcs_personnel")
                            addApps("personnel", service);
                        else if(authName === "zcs_etudiant")
                            addApps("etudiant", service);
                    break;
                default:
                    console.log("Unknown service");
                };

            }
        }
    );
}

/**
* Zimbra service
* Add unread messages number to Messagerie icon
* Add following week appointments number to Planning icon
**/
function getZimbraData(){
    var urlZimbra = "https://mail.univ-lorraine.fr/home/~/";
    var urlToMessage = urlZimbra + ".json?query=is:unread%20-in:sent%20-in:trash%20-in:junk";
    if($("#ns-widget .messagerie")){
        ajaxPerso(urlToMessage,
            function(data){
                var unreadMessages = JSON.parse(data).m;
                if(unreadMessages){
                    var messagerie = $("#ns-widget .messagerie");
                    var nbr = (unreadMessages.length < 99) ? unreadMessages.length : "+99";
                    var unreadNumber = "<span class='number'>" + nbr + "</span>";
                    messagerie.attr("title", "Messagerie : " + nbr + " message(s) non lu(s)");
                    var existingNumber = $("#ns-widget .messagerie .number");
                    if(existingNumber.length === 0)
                        messagerie.append(unreadNumber);
                    else
                        existingNumber.replaceWith(unreadNumber);
                }else{
                    console.log("no messages");
                }
            },
            function(){
                console.log("Failed connexion to Zimbra (Messagerie)");
            }
        );
    }

    if($("#ns-widget .planning")){
        //urlToAppointment = 'http://localhost/zimbra_widget/proxy.php?'+'account='+data.account+'&token='+data.token+'&object='+'appointment'+'&query='+'';
        urlToAppointment = urlZimbra + "calendar.json?start=1day&end=2y";
        ajaxPerso(urlToAppointment,
            function(data){
                var soonAppointments = JSON.parse(data).appt;
                if(soonAppointments){
                    var planning = $("#ns-widget .planning");
                    var nbr = (soonAppointments.length < 99) ? soonAppointments.length : "+99";
                    var soonNumber = "<span class='number'>" + nbr + "</span>";
                    planning.attr("title", "Planning : " + nbr + " rendez-vous dans les 7 prochains jours");
                    var existingNumber = $("#ns-widget .planning .number");
                    if(existingNumber.length === 0)
                        planning.append(soonNumber);
                    else
                        existingNumber.replaceWith(soonNumber);
                }else{
                    console.log("no appointments");
                }
            },
            function(){
                console.log("Failed connexion to Zimbra (Planning)");
            }
        );
    }
}

/**
* AddApps service
* Add application's icons to nineSquare
* @target : String which tells if the icons must be added to a student or a personnel of Université de Lorraine
* @service : JSON object that contains the details of the addApps service. It contains the apps to be added (with an option whether to put it at the beginning or at the end of the already present apps)
**/
function addApps(target, service){
    var urlZcs = "";
    if(target === "personnel")
        urlZcs = "https://auth-zcs.univ-lorraine.fr/univ-lorraine.fr.token-json";
    else if(target === "etudiant")
        urlZcs = "https://auth-zcs.univ-lorraine.fr/etu.univ-lorraine.fr.token-json";
    var service = service || {};
    ajaxPerso(urlZcs,
        function(data){
            applications = $("#ns-widget .applications");
            var apps = service.apps;
            var app = {};
            for(var i = 0; i < apps.length; i++){
                app = apps[ i ];
                var appTag = '<a class="vignette" title="' + app.title + '" href="' + app.url + '" ><span class="icon ' + app.title.toLowerCase() + '" title="' + app.title + '" style="background-image: url(\'' + app.iconUrl+"');\"></span></a>";
                if(app.end)
                    applications.append(appTag);
                else
                    applications.prepend(appTag);
            }
            //TODO : Remove magic number
            updateBoxSize(window.nswidget.maxApps);
        },
        function(){
            console.log("Failed connexion to ZCS");
        }
    );
}

/**
* tryConnexion service
* Try to connect to CAS and put a lock icon on if it fails. Remove it when it succeeds
* @iconUrl : String which corresponds to the url to the lock icon
* @configArray : JSON object that contains the details of the widget. It contains all the apps and services. It will be used to update the application when there is a state change
**/
function tryConnexion(iconUrl, configArray){
    var urlCAS = "https://auth.univ-lorraine.fr/login?service=https%3A%2F%2Fmail.univ-lorraine.fr%2Fzimbra%2Fpreauth%2FpreauthUL_PERS.jsp";
    ajaxPerso(urlCAS,
        function(data){
            if($("#ns-widget .lock").length < 1){
                var appButton = $("#ns-widget .icon.app-button");
                var lock = '<span class="lock"><img src="' + iconUrl+"\"></span>";
                appButton.prepend(lock);
                updateApplications(configArray);
            }
        },
        function(){
            var lock = $("#ns-widget .lock");
            if(lock.length >= 1){
                lock.remove();
                updateApplications(configArray);
            }
            console.log("You are connected to CAS");
        }
    );

}

/********************************************************
--------------------Utility functions--------------------
********************************************************/

function ajaxPerso(url, success, error){
    window.nswidget.ajaxCount++;
    checkOngoingAjax();
    $.ajax({
        type: "GET",
        url: url,
        contentType: "text/plain",
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        headers: {
            // Set any custom headers here.
            // If you set any non-simple headers, your server must include these
            // headers in the 'Access-Control-Allow-Headers' response header.
        },
        success: function(data){
            success(data);
            window.nswidget.ajaxCount--;
            checkOngoingAjax();
        },
        error: function(){
            error();
            window.nswidget.ajaxCount--;
            checkOngoingAjax();
        }
    });
}

function updateBoxSize(maxApps){
    var maxApps = maxApps || 9;
    var applicationsWidget = $("#ns-widget");
    var applications = $("#ns-widget .applications");
    var nbrApps = $("#ns-widget .vignette").length;
    var boxHeight = (maxApps > nbrApps) ? 70 * Math.ceil(nbrApps / 3) + 6 : 70 * Math.ceil(maxApps / 3) + 6; // Icon height * (row number) + 6 border widths
    if(boxHeight <= 6){
        boxHeight = 216;
    }
    applications.css("height", boxHeight);
    /**
        If there are more applications than the maximum value, we add a "Plus d'aplications" ("More applications") button
    **/
    if(nbrApps > maxApps){
        var display = applications.css("display");
        var plusButton = '<div class="plus-button" style="display:' + display+";\"><a href=\"\" onclick=\"return false;\">Plus d'applications</a></div>";
        applicationsWidget.append(plusButton);
        plusButton = $("#ns-widget .plus-button");
        plusButton.css("margin-top", boxHeight + 10 + 1); // plus-button offset = applications box height + applications box margin-top + 1

        // We add an event to toggle plusButton when we click on ns-icon with the applications block
        appButton = $("#ns-widget .app-button").click(function(){
            plusButton.toggle(0);
        });
        $(document).on("click", function(event){
            if(!$(event.target).closest(applications).length && !$(event.target).closest(appButton).length && !$(event.target).closest(".plus-button").length){
                plusButton.hide(0);
            }
        });
        var offset = appButton.offset().left;
        plusButton.css("margin-left", offset - 183 + 26); // button x coordinate - (applications block size)/2 + (button size/2)
        /**
        If someone click on "Plus d'applications", we change it to "Moins d'applications" ("Less applications")
        We also transform the applications block : overflow "hidden" to overflow "auto" which makes a scrollbar appear
        When you click on "Moins d'applications", the changes are reverted
        **/
        plusButton.children().on("click", function(){
            var boxWidth;
            if(applications.css("overflow") == "hidden"){
                boxWidth = applications.css("width");
                boxWidth = Math.round(boxWidth.substr(0, boxWidth.length - 2)) + 17; // If there are more applications than we want to show, a scrollbar will appear (overflow:auto) so we just add a scrollbar's width to the applications' box width
                applications.css("width", boxWidth);
                plusButton.css("width", boxWidth);
                applications.css("overflow", "auto");
                plusButton.children().html("Moins d'applications");
            }else if(applications.css("overflow") === "auto"){
                applications.scrollTop("0");
                boxWidth = applications.css("width");
                boxWidth = Math.round(boxWidth.substr(0, boxWidth.length - 2)) - 17; // If there are more applications than we want to show, a scrollbar will appear (overflow:auto) so we just add a scrollbar's width to the applications' box width
                applications.css("width", boxWidth);
                plusButton.css("width", boxWidth);
                applications.css("overflow", "hidden");
                plusButton.children().html("Plus d'applications");
            }
        });

    }
}

function updateApplications(configArray){
    var apps = configArray.apps;
    var services = configArray.services;
    var applications = $("#ns-widget .applications");
    var nbrApps = apps.length;

    // If there are icons, we remove them and create totally new ones
    $("#ns-widget a.vignette").remove();

    // We create the clickable icons with the configuration JSON file
    for(var i = 0; i < nbrApps; i++){
        var app = apps[ i ];
        var appTag = '<a class="vignette" title="' + app.title + '" href="' + app.url + '" ><span class="icon ' + app.title.toLowerCase() + '" title="' + app.title + '" style="background-image: url(\'' + app.iconUrl+"');\"></span></a>";
        applications.append(appTag);
    }

    //We add special features to the icons if there are services to call/execute in the configuration JSON file
    // TODO : Slef-genereating arrays
    var casServices = [];
    var zimbraServices = [];
    var zcs_personnelServices = [];
    var zcs_etudiantServices = [];
    for(var i = 0; i < services.length; i++){
        var service = services[ i ];
        var auth = service.auth || null;
        if(auth === "casZCS_personnel"){
            zcs_personnelServices.push(service);
        }else if(auth === "casZCS_etudiant"){
            zcs_etudiantServices.push(service);
        }else if(auth === "casZimbra"){
            zimbraServices.push(service);
        }else if(auth === "cas"){
            casServices.push(service);
        }else{
            var refreshTime = service.refreshTime;
            switch(service.name){ // Executes services that don't require authentification
            case "connexion":
                tryConnexion("img/connexion.png", configArray);
                if(refreshTime > 0){ // If the attribute refreshTime exists, we execute the service every refreshTime seconds
                        $(document).ready(function(){
                            setInterval(tryConnexion, refreshTime,"img/connexion.png", configArray);
                        });
                    }
                break;
            default:
                console.log("Unknown service");
            }
        }
    }
    if(casServices.length !== 0) authCas("cas", casServices);
    if(zcs_personnelServices.length !== 0) authCas("zcs_personnel", zcs_personnelServices);
    if(zcs_etudiantServices.length !== 0) authCas("zcs_etudiant", zcs_etudiantServices);
    if(zimbraServices.length !== 0) authCas("zimbra", zimbraServices);
}

function checkOngoingAjax(){
    var loader = $(".loader img");
    if(window.nswidget.ajaxCount > 0){
        loader.css("display", "inline-block");
    }else{
        loader.css("display", "none");
    }
}