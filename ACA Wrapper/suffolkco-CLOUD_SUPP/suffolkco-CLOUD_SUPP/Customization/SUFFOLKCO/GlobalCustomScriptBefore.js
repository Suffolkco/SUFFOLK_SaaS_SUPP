$(document).ready(function () {
	$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');
		$("head link[rel='stylesheet']").last().after("<link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>");
	$("<div class='menu'><i class='material-icons'>settings</i></div>").insertBefore(".ACA_RegisterLogin");
	$(".menu").click(function() { $(".ACA_RegisterLogin").slideToggle( "fast", "linear" ) });
	$(".ACA_CenterOn").click(function(e) { 
		if($('.ACA_CenterOff').is(':hidden')) {
		e.preventDefault(); e.stopPropagation(); $(".ACA_CenterOff").toggle() }
	});
	
	var pathname = window.location.pathname;
	pathArray = pathname.split("/");
	rootDir = "/" + pathArray[1];
	$(".aca_wrapper").before("<div class='header'></div>");
	$(".header").after("<div id='google_translate_element' style='width: 120em; margin: 0 auto;'></div>");
	$(".header").load(rootDir + "/header.html");
	$(".aca_wrapper").after("<div class='footer'></div>");
	$(".footer").load(rootDir + "/bottom.html");
	
	$("a[title*='Advanced Search']").text("Advanced Search");
});