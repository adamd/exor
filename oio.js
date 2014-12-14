module.exports = {
  search: function(q, db) {
      //var db = require('orchestrate')('c5bd021c-cb12-44ee-b1e9-52e7098f93fb');
      db.get('exors_fulltext', 'id12890')
      .then(function (result) {
        return "nothing... or?";
        //return result.body;
      })
      .fail(function (err) {
        return false;
      });
  }


};
