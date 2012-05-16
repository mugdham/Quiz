;
(function() {
var score =0;
var id =0;
  window.QuizApp = Ember.Application.create({
    Controllers: Ember.Namespace.create(),
    Models: Ember.Namespace.create(),
    Helpers: Ember.Namespace.create(),
    Views: Ember.Namespace.create(),
    Data: Ember.Namespace.create(),    
	
    ready: function() {
      this.config = QuizApp.Models.Config.create({
        content: this.Data.config
      });	  
      return this.initMapWithItemsApp();
    },
    initMapWithItemsApp: function() {	  
	  //SA Quiz
	   var questions, questionsArray;	   
	  questions = this.Data.quiz.map(function(question) {
        return QuizApp.Models.Question.create(question);
      });
      questionsArray = QuizApp.Models.Questions.create({
        content: questions
      });
	  //EA QuizQ      
      return this.main = QuizApp.Controllers.Main.create({
       	//SA QuizQ
		questions: questionsArray,
		question:questionsArray.content[id],
		//EA QuizQ       		
		
		next: function() {        
		alert($("input[@name=default]:checked").val());	
	    var userAnswer = $("input[@name=default]:checked").val();
		var correctAnswer = this.question.correctAnswer;			
			if(userAnswer == correctAnswer)
			{
				score = score + 10;				
			}			
			id= id+1;
			this.set('question',questionsArray.content[id]);
		alert(score);			
		}			
      });
    }
  });

}).call(this);

(function() {

  QuizApp.Models.Config = Ember.Object.extend({
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
  
  var set = Ember.set, get = Ember.get;
  //SA Radio Buton    
  Ember.RadioButton = Ember.View.extend({
  title: null,  
  group: "radio_button",  
  classNames: ['ember-radio-button'],
  defaultTemplate: Ember.Handlebars.compile('<input type="radio" {{ bindAttr disabled="disabled" name="group" value="option" checked="checked"}} />{{title}}'),
  bindingChanged: function(){
   if(this.get("option") == get(this, 'value')){
       this.set("checked", true);
    }
	else
	{
	this.set("checked", false);
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
  QuizApp.Models.Questions = Ember.ArrayProxy.extend({
    
  });

  QuizApp.Models.Question = Ember.Object.extend({
    name: (function() {
      return this.get('question');
    }).property('question')
	  
  });
  //EA QuizQ
  
  QuizApp.Controllers.Main = Ember.Object.extend({
    filters: []   
  });

  QuizApp.Views.App = Ember.View.extend({
    nameBinding: 'QuizApp.config.name',
    typeBinding: 'QuizApp.config.type',
    mainBinding: 'QuizApp.main',   
	//SA Quiz
	questionBinding :'main.question',
	//EA Quizs    
    templateName: 'app/templates/app'    
  });  

   QuizApp.Views.Question = Ember.View.extend({
   zoomedBinding: 'parentView.zoomed',
    nameBinding: 'question.name',
    classNames: ['question'],
    classNameBindings: ['statusName'],
    attributeBindings: ['style'],
	questionIdBinding: 'question.questionId',	
	questionOptionsBinding: 'question.options'
	
	
  });  
  
	QuizApp.Views.Quiz = Ember.View.extend({
    mainBinding: 'QuizApp.main',
    templateName: 'app/templates/quiz'
  });

}).call(this);
;
