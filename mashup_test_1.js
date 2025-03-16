/* main.js - Qlik Sense Mashup for Qlik Cloud */

/* Configuration settings for Qlik Cloud connection */
var config = {
  host: "2mfrj5yb8kxk6yq.eu.qlikcloud.com",
  prefix: "/",
  port: 443, // Secure HTTPS port
  isSecure: true
};

/* Configure require.js to load Qlik resources */
require.config({
  baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
  paths: {
    qlik: "js/qlik"
  }
});

/* Main require.js block to load Qlik and setup the mashup */
require(["qlik"], function(qlik) {

  // Global error handling
  var control = false;
  qlik.on("error", function(error) {
    // Append error message to a designated popup element (make sure your HTML contains these elements)
    $('#popupText').append(error.message + "<br>");
    if (!control) {
      control = true;
      $('#popup').delay(1000).fadeIn(1000).delay(11000).fadeOut(1000);
    }
  });

  // Prevent body scrolling (ensure your HTML/CSS is set up accordingly)
  $("body").css("overflow", "hidden");

  // App UI constructor to manage UI elements (title, bookmarks, selections, etc.)
  function AppUi(app) {
    var me = this;
    this.app = app;
    app.global.isPersonalMode(function(reply) {
      me.isPersonalMode = reply.qReturn;
    });
    app.getAppLayout(function(layout) {
      $("#title").html(layout.qTitle);
      $("#title").attr("title", "Last reload: " + layout.qLastReloadTime.replace(/T/, ' ').replace(/Z/, ' '));
    });
    app.getList('SelectionObject', function(reply) {
      $("[data-qcmd='back']").toggleClass('disabled', reply.qSelectionObject.qBackCount < 1);
      $("[data-qcmd='forward']").toggleClass('disabled', reply.qSelectionObject.qForwardCount < 1);
    });
    app.getList("BookmarkList", function(reply) {
      var str = "";
      reply.qBookmarkList.qItems.forEach(function(value) {
        if (value.qData.title) {
          str += '<li><a data-id="' + value.qInfo.qId + '">' + value.qData.title + '</a></li>';
        }
      });
      str += '<li><a data-cmd="create">Create</a></li>';
      $('#qbmlist').html(str).find('a').on('click', function() {
        var id = $(this).data('id');
        if (id) {
          app.bookmark.apply(id);
        } else {
          var cmd = $(this).data('cmd');
          if (cmd === "create") {
            $('#createBmModal').modal('show');
          }
        }
      });
    });
    $("[data-qcmd]").on('click', function() {
      var $element = $(this);
      switch ($element.data('qcmd')) {
        case 'clearAll':
          app.clearAll();
          break;
        case 'back':
          app.back();
          break;
        case 'forward':
          app.forward();
          break;
        case 'lockAll':
          app.lockAll();
          break;
        case 'unlockAll':
          app.unlockAll();
          break;
        case 'createBm':
          var title = $("#bmtitle").val(), desc = $("#bmdesc").val();
          app.bookmark.create(title, desc);
          $('#createBmModal').modal('hide');
          break;
      }
    });
  }

  // Open the Qlik Sense app using your app ID
  var app = qlik.openApp('f31aa1ed-df09-4047-83bd-1935ebb903d0', config);

  // Embed Qlik Sense objects into HTML elements
  // Ensure your index.html contains elements with these corresponding IDs
  app.getObject('QV03', 'jpYgSG');
  app.getObject('QV05', 'FCsqWJ');
  app.getObject('CurrentSelections', 'CurrentSelections');
  app.getObject('QV04', 'YLNPP');
  app.getObject('QV02', 'TasyZc');
  app.getObject('QV01', 'HTSjhJ');

  // Initialize the App UI
  if (app) {
    new AppUi(app);
  }
});
