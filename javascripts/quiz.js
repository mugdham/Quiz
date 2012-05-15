;
(function() {

  window.DashboardApp = Ember.Application.create({
    Controllers: Ember.Namespace.create(),
    Models: Ember.Namespace.create(),
    Helpers: Ember.Namespace.create(),
    Views: Ember.Namespace.create(),
    Data: Ember.Namespace.create(),    

    ready: function() {
      this.config = DashboardApp.Models.Config.create({
        content: this.Data.config
      });	  
      return this.initMapWithItemsApp();
    },
    initMapWithItemsApp: function() {	  
	  //SA Quiz
	   var questions, questionsArray;	   
	  questions = this.Data.quiz.map(function(question) {
        return DashboardApp.Models.Question.create(question);
      });
      questionsArray = DashboardApp.Models.Questions.create({
        content: questions
      });
	  //EA QuizQ      
      return this.main = DashboardApp.Controllers.Main.create({
       	//SA QuizQ
		questions: questionsArray,
		//EA QuizQ       		
		radio1: ""        
      });
    }
  });

}).call(this);

(function() {

  DashboardApp.Models.Config = Ember.Object.extend({
    drilldownMetrics: (function() {
      return this.get('content').drilldownMetrics;
    }).property('content'),
    mapWithItems: (function() {
      return this.get('content').mapWithItems;
    }).property('content'),
    mapWithRegions: (function() {
      return this.get('content').mapWithRegions;
    }).property('content'),
    name: (function() {
      return this.get('content').name;
    }).property('content'),
    type: (function() {
      return this.get('content').type;
    }).property('content'),
    theme: (function() {
      return this.get('drilldownMetrics').theme;
    }).property('content'),
    current_chart_type: (function() {
      return this.get('drilldownMetrics').current_chart.type;
    }).property('content'),
    historical_chart_type: (function() {
      return this.get('drilldownMetrics').historical_chart.type;
    }).property('content'),
    historical_chart_title: (function() {
      return this.get('drilldownMetrics').historical_chart.title;
    }).property('content')
  });
  
  //SA Radio Buton
  Ember.RadioButton = Ember.View.extend({
  title: null,
  checked: false,
  group: "radio_button",
  disabled: false,
  classNames: ['ember-radio-button'],
  defaultTemplate: Ember.Handlebars.compile('<label><input type="radio" {{ bindAttr disabled="disabled" name="group" value="option" checked="checked"}} />{{title}}</label>'),
  bindingChanged: function(){
   if(this.get("option") == get(this, 'value')){
       this.set("checked", true);
    }
  }.observes("value"),    
  change: function() {
    Ember.run.once(this, this._updateElementValue);
  },
  _updateElementValue: function() {
    var input = this.$('input:radio');
    set(this, 'value', input.attr('value'));
  }
});  
  //EA Radio Button
  
  //SA QuizQ  
  DashboardApp.Models.Questions = Ember.ArrayProxy.extend({
    
  });

  DashboardApp.Models.Question = Ember.Object.extend({
    name: (function() {
      return this.get('question');
    }).property('question'),
	  value: (function() {
      var currentQuestion;
      currentQuestion = DashboardApp.main.get('currentQuestion');
      return this.get(currentQuestion);
    }).property(),
  });
  //EA QuizQ
  
  DashboardApp.Controllers.Main = Ember.Object.extend({
    filters: []   
  });

  DashboardApp.Views.App = Ember.View.extend({
    nameBinding: 'DashboardApp.config.name',
    typeBinding: 'DashboardApp.config.type',
    mainBinding: 'DashboardApp.main',   
	//SA Quiz
	questionsBinding :'main.questions',
	//EA Quizs    
    templateName: 'app/templates/app'    
  });  

   DashboardApp.Views.Question = Ember.View.extend({
   zoomedBinding: 'parentView.zoomed',
    nameBinding: 'question.name',
    classNames: ['question'],
    classNameBindings: ['statusName'],
    attributeBindings: ['style'],	
    click: function() {      
      return false;
    },
	//SA title -- question
	countryRank: (function() {
      return this._parentView.content.get('question');
    }).property('DashboardApp.main.currentQuestion')
	
	});
//EA title -- question
	
	DashboardApp.Views.Quiz = Ember.View.extend({
    mainBinding: 'DashboardApp.main',
    templateName: 'app/templates/quiz'
  });

}).call(this);
;
