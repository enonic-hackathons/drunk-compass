var mustacheLib = require('/lib/xp/mustache');
var thymeleafLib = require('/lib/xp/thymeleaf');

var router = require('/lib/router')();
var helper = require('/lib/helper');
var swController = require('/lib/pwa/sw-controller');
var siteTitle = 'Drunk compass';
var portal = require('/lib/xp/portal');

var renderPage = function (pageName) {

    return function () {

        var wsUrl = portal.serviceUrl({service: 'message-hub', type: 'absolute'});
        wsUrl = 'wss' + wsUrl.substring(wsUrl.indexOf(':'));

        //var listTemplate = encodeURI(thymeleafLib.render(resolve('/pages/listTemplate.html'),{}));
        var listTemplate = encodeURI(mustacheLib.render(resolve('/pages/listTemplate.html'),{}));
        log.info("listTemplate: %s",listTemplate);
        return {
            contentType:'text/html',
            body: mustacheLib.render(resolve('pages/' + pageName), {
                title: siteTitle,
                version: app.version,
                baseUrl: helper.getBaseUrl(),
                precacheUrl: helper.getBaseUrl() + '/precache',
                themeColor: '#FFF',
                wsUrl: wsUrl,
                header:mustacheLib.render(resolve('/pages/header.html'),
                    {title:siteTitle}),
                menu: mustacheLib.render(resolve('/pages/menu.html'),
                    {title:siteTitle, version:app.version, baseUrl:helper.getBaseUrl()}),
                styles: mustacheLib.render(resolve('/pages/styles.html')),
                listTemplate: listTemplate,
                serviceWorker: mustacheLib.render(
                    resolve('/pages/sw.html'), {
                    title: siteTitle,
                    baseUrl: helper.getBaseUrl(),
                    precacheUrl: helper.getBaseUrl() + '/precache',
                    appUrl: helper.getAppUrl()
                })
            })
        };
    }
};

router.get('/', renderPage('main.html'));

router.get('/about', renderPage('about.html'));

router.get('/contact', renderPage('contact.html'));

router.get('/sw.js', swController.get);

exports.get = function (req) {
    return router.dispatch(req);
};

