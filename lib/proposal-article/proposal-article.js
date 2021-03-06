/**
 * Module dependencies.
 */

var domify = require('domify')
  , events = require('events')
  , empty = require('empty')
  , article = require('./article')
  , clause = require('./clause')
  , toArray = require('to-array')
  , truncate = require('truncate')
  , Tip = require('tip')
  , config = require('config')
  , t = require('t')
  , classes = require('classes');

/**
 * Expose ProposalArticle
 */
module.exports = ProposalArticle;

/**
 * Creates a new proposal-article view
 * from proposals object.
 *
 * @param {Object} proposal proposal's object data
 * @return {ProposalArticle} `ProposalArticle` instance.
 * @api public
 */

function ProposalArticle (proposal) {
  if (!(this instanceof ProposalArticle)) {
    return new ProposalArticle(proposal);
  };

  this.proposal = proposal;
  this.clauses = proposal.clauses.sort(function(a, b) {
      var sort = a.order - b.order;
      sort = sort > 0 ? 1 : -1;
      return sort;
    }).map(function(c) {
      if (c.text) return t('Clause') + ' ' + c.clauseId + ': ' + c.text;
  });

  var baseUrl = config.protocol + "://" + config.host + (config.publicPort ? (":" + config.publicPort) : "");
  this.el = domify(article({
    proposal: proposal,
    clauses: this.clauses,
    baseUrl: baseUrl,
    t: t,
    truncate: truncate
  }));

  this.events = events(this.el, this);

  // We may want to call this on `inserted`
  toArray(this.el.querySelectorAll('.participant-profile'))
  .forEach(function(el) {
    Tip(el);
  });

  this.switchOn();
}

/**
 * Turn on event handlers on this view
 */

ProposalArticle.prototype.switchOn = function() {
  this.events.bind('click .clauses a.read-more', 'showclauses');
  this.events.bind('click .participants a.view-more', 'showparticipants');
}

/**
 * Turn off event handlers on this view
 */

ProposalArticle.prototype.switchOff = function() {
  this.events.unbind();
}

ProposalArticle.prototype.showclauses = function(ev) {
  ev.preventDefault();

  var container = this.el.querySelector('.clauses');
  empty(container);

  this.clauses.forEach(function(c) {
    container.appendChild(domify(clause({
      clause: c
    })));
  });

  this.events.unbind('click .clauses a.read-more');
}

ProposalArticle.prototype.showparticipants = function(ev) {
  ev.preventDefault();

  var hiddens = this.el.querySelectorAll('a.participant-profile.hide');
  for (var i = 0; i < hiddens.length; i++) {
    var hidden = hiddens[i];
    classes(hidden).remove('hide');
  }

  this.el.querySelector('.participants a.view-more').remove();
}
/**
 * Render
 *
 * @return {NodeElement} a prosal's article
 * @api public
 */

ProposalArticle.prototype.render = function(el) {
  if (1 === arguments.length) {

    // if string, then query element
    if ('string' === typeof el) {
      el = document.querySelector(el);
    };

    // if it's not currently inserted
    // at `el`, then append to `el`
    if (el !== this.el.parentNode) {
      el.appendChild(this.el);
    };

    // !!!: Should we return different things
    // on different conditions?
    // Or should we be consistent with
    // render returning always `this.el`
    return this;
  };

  return this.el;
}

/**
 * Append view to article
 *
 * @param {Element} el
 * @return {Element} a prosal's article
 * @api public
 */

ProposalArticle.prototype.append = function(el) {
  this.el.appendChild(el);
  return this;
}