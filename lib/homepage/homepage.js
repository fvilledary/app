/**
 * Module dependencies.
 */

var page = require('page');
var request = require('superagent');
var empty = require('empty');
var citizen = require('citizen');
var Article = require('proposal-article');
var List = require('proposal-list');
var Options = require('proposal-options');
var Comments = require('comments-view');
var sidebar = require('sidebar-list');
var classes = require('classes');
var o = document.querySelector.bind(document);
var bus = require('bus');
var log = require('debug')('homepage');

// Routing.
page('/', citizen.optional, load, function(ctx, next) {
  // Render sidebar list
  sidebar.render('aside.nav-proposal');

  // Build article's content container
  var article = new Article(ctx.law);

  // Build article's meta
  var options = new Options(ctx.law, citizen);
  var comments = new Comments('law', ctx.law.id);
  comments.fetch();

  // render article
  // Render page's content
  empty(o('section.app-content'))
  article.render('section.app-content');
  options.render('section.app-content');
  comments.render('section.app-content');

  classes(document.body).add('browser-page');

  bus.once('page:change', pagechange);

  function pagechange(url) {
    if (url !== ctx.path) o('section#browser').scrollTop = 0;
    if (/^\/$/.test(url)) return;
    if (/^\/(law|proposal)/.test(url)) return;
    classes(document.body).remove('browser-page');
  }
  log('render for %s', ctx.law.id);
});


/*
 * Load homepage data
 *
 * @param {Object} ctx page's context
 * @param {Function} next callback after load
 * @api private
 */

function load (ctx, next) {

  // Once ready, fetch article and meta
  // From first sidebar element
  sidebar.ready(function() {
    var law = sidebar.selected() || sidebar.items[0];

    log('fetch for %s', law.id);

    request
    .get('/api/law/' + law.id)
    .set('Accept', 'application/json')
    .end(function(err, res) {
      if (err || !res.ok) {
        log('Load error: %s', err || res.error);
        return;
      };
      ctx.law = law = res.body;
      sidebar.select(law.id);
      next();
    });


  })
}