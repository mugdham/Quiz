/* 
* jCountdown UI 1.0 jQuery UI Widget
* Copyright 2012 Tom Ellis http://www.webmuse.co.uk
* MIT Licensed (license.txt)
*/
(function($) {

var clear = window.clearInterval,
	floor = Math.floor,
	ceil = Math.ceil,
	msPerHr = 36E5,
	msPerDay = 864E5;
	
$.widget("jui.countdownui", {
	options : {
		date: null,
		updateTime: 1E3,
		minus: false,
		onChange: null,
		onComplete: null,
		onResume: null,
		onPause: null,
		leadingZero: false,
		offset: null,
		servertime: null,
		hoursOnly: false,
		minsOnly: true,
		secsOnly: false,
		hours: false,
		yearsAndMonths: false,
		direction: "down",
		yearsText: "years",
		monthsText: "months",
		daysText: "days",
		hoursText: "hours",
		minutesText: "minutes",
		secondsText: "seconds",
		speed: 500,
		fx: "turnDown"
	},
	_create: function() {
		
		var opts = this.options,
			$this = $(this.element),
			settings = {},
			func,
			$divUiYears,
			$divUiMonths,
			$divUi = $("<div>").addClass('jc-ui ui-widget ui-widget-content ui-corner-all'),
			$divUiDays = $("<div>").addClass('jc-ui-days ui-corner-left'),
			$divUiHours = $("<div>").addClass('jc-ui-hours'),
			$divUiMinutes = $("<div>").addClass('jc-ui-minutes'),
			$divUiSeconds = $("<div>").addClass('jc-ui-seconds ui-corner-right'),
			$pFirst = $("<p>").addClass("ui-widget-content ui-state-default jui-first jui-active"),
			$pLast = $("<p>").addClass("ui-widget-content ui-state-default jui-last jui-not-active"),
			testDate;


		if( opts.date === null ) {
			$.error("No Date passed to jCountdown UI. date option is required.");
			return false;
		}
			
		testDate = new Date(opts.date);
		
		if( testDate.toString() === "Invalid Date" ) {
			$.error("Invalid Date passed to jCountdown UI: " + opts.date);
		}
					
		//If this element already has a countdown timer, change the settings
		if( $this.data("jcdUIData") ) {
			$this.countdownui("changeSettings", this.options, true);
			opts = $this.data("jcdUIData");
		}
				
		if( opts.yearsAndMonths ) {
			$divUiYears = $("<div>").addClass('jc-ui-years ui-corner-left');
			$divUiMonths = $("<div>").addClass('jc-ui-months');
		}
		
		//Add event handlers where set
		if( opts.onChange ) {
			$this.on("change.jcduievt", opts.onChange );
		}
		
		if( opts.onComplete ) {
			$this.on("complete.jcduievt", opts.onComplete );
		}
		
		if( opts.onPause ) {
			$this.on("pause.jcduievt", opts.onPause );
		}

		if( opts.onResume ) {
			$this.on("resume.jcduievt", opts.onResume );
		}
		
		settings = {
			originalHTML : $this.html(),
			date : opts.date,
			hoursOnly : opts.hoursOnly,
			minsOnly: opts.minsOnly,
			secsOnly: opts.secsOnly,
			yearsAndMonths: opts.yearsAndMonths,
			leadingZero : opts.leadingZero,
			offset: opts.offset,
			servertime: opts.servertime,
			updateTime : opts.updateTime,
			direction : opts.direction,
			minus : opts.minus,
			onChange : opts.onChange,
			onComplete : opts.onComplete,
			onResume : opts.onResume,
			onPause : opts.onPause,
			timer : 0,
			prevYears: undefined,
			prevMonths: undefined,
			prevDays: undefined,
			prevHrs: undefined,
			prevMins: undefined,
			prevSec: undefined,
			yearsText: opts.yearsText,
			monthsText: opts.monthsText,
			daysText: opts.daysText,
			hoursText: opts.hoursText,
			minutesText: opts.minutesText,
			secondsText: opts.secondsText,
			speed: opts.speed,
			fx: opts.fx,
			hasCompleted : false							
		};
				
		$this.html('');
		
		if( !settings.hoursOnly ) {
			$divUiDays.addClass("ui-corner-left");
			$divUiDays.append( $pFirst.clone(), $pLast.clone() );
		} else {
			$divUiHours.addClass("ui-corner-left");
			$divUiDays.hide();
		}
		
		if(!settings.minsOnly ) {
			//$divUiDays.addClass("ui-corner-left");
			//$divUiDays.append( $pFirst.clone(), $pLast.clone() );
		} else {
			$divUiMinutes.addClass("ui-corner-left");
			$divUiDays.hide();
			$divUiHours.hide();
		}
		
		if( opts.yearsAndMonths ) {
			$divUiDays.removeClass('ui-corner-left');			
		}

		$divUiHours.append( $pFirst.clone(), $pLast.clone() );
		$divUiMinutes.append( $pFirst.clone(), $pLast.clone() );
		$divUiSeconds.append( $pFirst.clone(), $pLast.clone() );
		
		if( settings.yearsAndMonths ) {
			$divUiYears.append( $pFirst.clone(), $pLast.clone() );
			$divUiMonths.append( $pFirst.clone(), $pLast.clone() );	
			$divUi.append( $divUiYears, $divUiMonths );
		}
		
		$divUi.append( $divUiDays, $divUiHours, $divUiMinutes, $divUiSeconds ).appendTo( $this );

		if( opts.servertime !== null ) {
			var tempTime,
				local;
			local = new Date();	
			tempTime = ( $.isFunction( settings.servertime ) ) ? settings.servertime() : settings.servertime;
			settings.difference = local.getTime() - tempTime;
		}
						
		func = $.proxy( this._timerFunc, this );
		settings.timer = setInterval( func, settings.updateTime );

		$this.data( "jcdUIData", settings );
		func();
	},
	_timerFunc: function() {
		//Function runs at set interval updating countdown
		var $this = $(this.element),
			$divUiYears = $this.find('.jc-ui-years'),
			$divUiMonths = $this.find('.jc-ui-months'),
			$divUiDays = $this.find('.jc-ui-days'),
			$divUiHours = $this.find('.jc-ui-hours'),
			$divUiMinutes = $this.find('.jc-ui-minutes'),
			$divUiSeconds = $this.find('.jc-ui-seconds'),
			now,
			date,
			timeLeft,
			yearsLeft,
			monthsLeft,
			eDaysLeft,
			daysLeft,
			eHrsLeft,
			hrsLeft,
			minsLeft,					
			eMinsleft,
			secLeft,
			time = "",
			settings = $this.data("jcdUIData"),
			config,
			diff;
			
		if( !settings ) {
			return false;
		}
		
		config = {
			cb: $.noop(),
			cssBefore: {},
			cssAfter: {},
			speedIn: settings.speed,
			speedOut: settings.speed,
			animIn: {},
			animOut: {},
			easeIn: null,
			easeOut: null,
			sync : true	
		};
		
		if( settings.offset === null && settings.servertime === null ) {
			now = new Date();
		} else if( settings.offset !== null ) {
			now = this._getTZDate( settings.offset );
		} else {
			now = this._getTZDate( null, settings.difference ); //Date now
		}
				
		date = new Date( settings.date ); //Date to countdown to
		
		timeLeft = ( settings.direction === "down" ) ? date.getTime() - now.getTime() : now.getTime() - date.getTime();	
		
		diff = Math.round( timeLeft / 1000 );
		
		secLeft = diff % 60;
		diff = floor( diff / 60 );
		minsLeft = diff % 60;
		diff = floor( diff / 60 );
		hrsLeft = diff % 24;
		diff = floor( diff / 24 );
		daysLeft = diff;
					
		if( settings.yearsAndMonths ) {
			yearsLeft = floor( diff / 365 );
			diff = floor( diff % 365 );
			monthsLeft = floor( diff / 30 );
			if( monthsLeft === 12 ) {
				yearsLeft = 1;
				monthsLeft = 0;
				diff = 12;
			}

			daysLeft = ceil( diff % 30 ); // Remainder of months left
		}
		
		if( settings.hoursOnly ) {
			hrsLeft += daysLeft * 24;
			daysLeft = 0;
		}

		//Assumes you are only using dates in the near future 
		//as years and months aren't taken into account
		if( settings.minsOnly ) {
			minsLeft += ( hrsLeft * 60 ) + ( ( daysLeft * 24 ) * 60 );
			daysLeft = 0;
			hrsLeft = 0;
		}

		//Assumes you are only using dates in the near future 
		//as years, months and days aren't taken into account
		if( settings.secsOnly ) {
			secLeft += ( minsLeft * 60 );
			daysLeft = 0;
			hrsLeft = 0;
			minsLeft = 0;
		}
				
		if ( settings.leadingZero ) {
			
			if ( yearsLeft < 10 ) {
				yearsLeft = "0" + yearsLeft;
			}
			
			if ( monthsLeft < 10 ) {
				monthsLeft = "0" + monthsLeft;
			}
						
			if ( daysLeft < 10 && !settings.hoursOnly ) {
				daysLeft = "0" + daysLeft;
			}
			if ( hrsLeft < 10 ) {
				hrsLeft = "0" + hrsLeft;
			}
			if ( minsLeft < 10 ) {
				minsLeft = "0" + minsLeft;
			}
			if ( secLeft < 10 ) {
				secLeft = "0" + secLeft;
			}
		}
				
		if( !settings.minus && ( settings.direction === "down" && now >= date ) ) {
			settings.hasCompleted = true;
		}
		
		if( !settings.hoursOnly ) {
			if( settings.prevDays === undefined ) {
				settings.prevDays = daysLeft;
				$divUiDays.find('p.jui-active').html( daysLeft + " " + settings.daysText );
			}
		}
		
		if( settings.yearsAndMonths ) {
			
			if( settings.prevYears === undefined ) {
				settings.prevYears = yearsLeft;
				$divUiYears.find('p.jui-active').html( yearsLeft + " " + settings.yearsText );
			}		

			if( settings.prevMonths === undefined ) {
				settings.prevMonths = monthsLeft;
				$divUiMonths.find('p.jui-active').html( monthsLeft + " " + settings.monthsText );
			}	
		}
		
		if( settings.prevHrs === undefined ) {
			settings.prevHrs = hrsLeft;
			$divUiHours.find('p.jui-active').html( hrsLeft + " " + settings.hoursText );
		}
		if( settings.prevMins === undefined ) {
			settings.prevMins = minsLeft;
			$divUiMinutes.find('p.jui-active').html( minsLeft + " " + settings.minutesText );
		}
		if( settings.prevSec === undefined ) {
			settings.prevSec = secLeft;
			$divUiSeconds.find('p.jui-active').html( secLeft + " " + settings.secondsText );
		}
		
		
		if( settings.yearsAndMonths ) {
		
			if( settings.prevYears !== yearsLeft ) {
				config.timeLeft = yearsLeft;
				config.timeText = settings.yearsText;

				$.fn.countdownui.transitions[settings.fx]( $divUiYears, config );
				$.fn.countdownui.animate( $divUiYears, config );						
			}	

			if( settings.prevMonths !== monthsLeft ) {
				config.timeLeft = monthsLeft;
				config.timeText = settings.monthsText;

				$.fn.countdownui.transitions[settings.fx]( $divUiMonths, config );
				$.fn.countdownui.animate( $divUiMonths, config );						
			}
			
		}
		
		if( settings.prevDays !== daysLeft && !settings.hoursOnly ) {
			config.timeLeft = daysLeft;
			config.timeText = settings.daysText;
			
			$.fn.countdownui.transitions[settings.fx]( $divUiDays, config );
			$.fn.countdownui.animate( $divUiDays, config );
		}
		
		if( settings.prevHrs !== hrsLeft ) {
			config.timeLeft = hrsLeft;
			config.timeText = settings.hoursText;
			
			$.fn.countdownui.transitions[settings.fx]( $divUiHours, config );
			$.fn.countdownui.animate( $divUiHours, config );						
		}
		
		if( settings.prevMins !== minsLeft ) {
						
			config.timeLeft = minsLeft;
			config.timeText = settings.minutesText;
			
			$.fn.countdownui.transitions[settings.fx]( $divUiMinutes, config );
			$.fn.countdownui.animate( $divUiMinutes, config );		
		}
		
		if( settings.prevSec !== secLeft ) {

			config.timeLeft = secLeft;
			config.timeText = settings.secondsText;
			
			$.fn.countdownui.transitions[settings.fx]( $divUiSeconds, config );
			$.fn.countdownui.animate( $divUiSeconds, config );
		}	
		
		settings.yearsLeft = yearsLeft;
		settings.monthsLeft = monthsLeft;	
		settings.daysLeft = daysLeft;	
		settings.hrsLeft = hrsLeft;
		settings.minsLeft = minsLeft;		
		settings.secLeft = secLeft;
		
		settings.prevYears = yearsLeft;
		settings.prevMonths = monthsLeft;
				
		settings.prevDays = daysLeft;
		settings.prevHrs = hrsLeft;
		settings.prevMins = minsLeft;
		settings.prevSec = secLeft;
				
		$this.trigger("change.jcduievt", [settings] );
		
		if ( settings.hasCompleted ) {
			$this.trigger("complete.jcduievt");
			clearInterval( settings.timer );
		}		
	},
	_getTZDate : function( offset, difference ) {					
		//Returns a new date based on an offset (set in options as "offset")
		//Useful when you want to match a server time, not a local PC time
		var hrs,
			dateMS,
			extra,
			curHrs,
			tmpDate = new Date();
		
		if( offset === null ) {
			dateMS = tmpDate.getTime() - difference;
		} else {				
			hrs = offset * msPerHr;
			curHrs = tmpDate.getTime() - ( ( -tmpDate.getTimezoneOffset() / 60 ) * msPerHr ) + hrs;
			dateMS = tmpDate.setTime( curHrs );
		}
		return new Date( dateMS );
		
	},
	complete: function() {
		var $this = $(this.element),
			settings = $this.data("jcdUIData");

		if( !settings ) {
			return false;
		}
		//Clear timer
		clearInterval( settings.timer );
		settings.hasCompleted = true;
		//Update setting, trigger complete event handler, then off all events
		//We don"t delete the settings in case they need to be checked later on
		$this.data("jcdUIData", settings).trigger("complete.jcduievt").off(".jcduievt");
		
		return true;		
	},
	destroy: function() {
		// now do other stuff particular to this widget
		var $this = $(this.element),
			settings;

		settings = $this.data("jcdUIData");
		
		if( !settings ) {
			return false;
		}
		
		$.Widget.prototype.destroy.call( this );
		
		//Clear timer
		clearInterval( settings.timer );
		//Unbind all events, remove data and put DOM Element back to its original state (HMTL wise)
		$this.off(".jcduievt").removeData("jcdUIData").html( settings.originalHTML );
		return true;
	},
	changeSettings: function( options, internal /* used internally */ ) {
		//Like resume but with resetting/changing options
		var $this  = $(this.element),
			settings,
			testDate,
			func = $.proxy( this._timerFunc, this );
			
		if( !$this.data("jcdUIData") ) {
			return true;
		}

		if( options.hasOwnProperty("date") ) {
			testDate = new Date(options.date);
			
			if( testDate.toString() === "Invalid Date" ) {
				$.error("Invalid Date passed to jCountdown UI: " + options.date);
			}
		}
				
		settings = $.extend( {}, $this.data("jcdUIData"), options );						
		
		settings.completed = false;
		//Clear the timer, as it might not be needed
		clear( settings.timer );					
		$this.off(".jcduievt").data("jcdUIData", settings);	
		
		//As this can be accessed via the init method as well,
		//we need to check how this method is being accessed
		if( !internal ) {		
			if( settings.onChange ) {
				$this.on("change.jcduievt", settings.onChange);
			}

			if( settings.onComplete ) {
				$this.on("complete.jcduievt", settings.onComplete);
			}
	
			if( settings.onPause ) {
				$this.on("pause.jcduievt", settings.onPause );
			}

			if( settings.onResume ) {
				$this.on("resume.jcduievt", settings.onResume );
			}
	
			settings.timer = setInterval( func, settings.updateTime );
			$this.data("jcdUIData", settings);
			func(); //Needs to run straight away when changing settings
		}
	},
	resume: function() {	
		//Resumes a countdown timer
		var $this = $(this.element),
			settings = $this.data("jcdUIData"),
			func = $.proxy( this._timerFunc, $this );
		
		if( !settings ) {
			return $this;
		}

		$this.data("jcdUIData", settings).trigger("resume.jcduievt");
		//We only want to resume a countdown that hasn't finished
		if( !settings.hasCompleted ) {
			settings.timer = setInterval( func, settings.updateTime );						
			func();
		}
	},
	pause: function() {	
		//Pause a countdown timer			
		var $this = $(this.element),
			settings = $this.data("jcdUIData");

		if( !settings ) {
			return $this;
		}
		//Clear interval (Will be started on resume)
		clear( settings.timer );
		//Trigger pause event handler
		$this.data("jcdUIData", settings).trigger("pause.jcduievt");
	},
	getSettings: function( name ) {	
		var $this = $(this.element),
			settings = $this.data("jcdUIData");
		
		//If an individual setting is required
		if( name && settings ) {
			//If it exists, return it
			if( settings.hasOwnProperty( name ) ) {
				return settings[name];
			}
			return undefined;
		}
		//Return all settings or undefined
		return settings;
	}
});


$.fn.countdownui.transitions = {	
	turnDown: function( $elem, opts ) {
		
		var $activeElem = $elem.find('p.jui-active'),	
			$inactiveElem = $elem.find('p.jui-not-active');

		opts.animOut = 'jswing';
		opts.animIn = 'jswing';
					
		opts.animIn = { 'top' : '0' };
		opts.animOut = { 'top' : '25px' };
		opts.cb = function(){
			$activeElem.removeClass('jui-active').addClass('jui-not-active').css('top', '-25px').hide();
			$inactiveElem.removeClass('jui-not-active').addClass('jui-active');	
		};
		
		//opts.cssBefore = { top: 0, left: 0 };
	},
	turnUp: function( $elem, opts ) {
		
		var $activeElem = $elem.find('p.jui-active'),	
			$inactiveElem = $elem.find('p.jui-not-active');

		opts.animOut = 'jswing';
		opts.animIn = 'jswing';
					
		opts.animIn = { 'top' : '0' };
		opts.animOut = { 'top' : '-25px' };
		
		$inactiveElem.css('top', '25px');
		
		opts.cb = function(){
			$activeElem.removeClass('jui-active').addClass('jui-not-active').css('top', '25px').hide();
			$inactiveElem.removeClass('jui-not-active').addClass('jui-active');	
		};
		
		//opts.cssBefore = { top: '25px' };
		//opts.cssAfter = { top: '25px' };
	},
	fade: function( $elem, opts ) {	
		var $activeElem = $elem.find('p.jui-active'),	
			$inactiveElem = $elem.find('p.jui-not-active');
		
		
		opts.animOut = 'jswing';
		opts.animIn = 'jswing';
		
		$inactiveElem.css({
			'zIndex': 5,
			'top': '0',
			opacity:1
		}).show();

		$activeElem.css({
			'zIndex': 6,
			'top': '0'
		});
				
		opts.animOut = {opacity:0};
		
		opts.cb = function(){
			$activeElem.removeClass('jui-active').addClass('jui-not-active').css('zIndex', '5').hide();
			$inactiveElem.removeClass('jui-not-active').addClass('jui-active').css('zIndex', '6');	
		};
		
		//opts.cssBefore = { top: 0, left: 0 };
	},
	basic: function( $elem, opts ) {
		var $activeElem = $elem.find('p.jui-active'),	
			$inactiveElem = $elem.find('p.jui-not-active');
		
		opts.animOut = 'jswing';
		opts.animIn = 'jswing';
			
		$inactiveElem.css({
			'zIndex': 5,
			'top': '0',
			opacity:1
		}).show();

		$activeElem.css({
			'zIndex': 6,
			'top': '0',
			opacity:0
		});
				
		opts.animOut = {};
		
		opts.cb = function(){
			$activeElem.removeClass('jui-active').addClass('jui-not-active').css('zIndex', '5').hide();
			$inactiveElem.removeClass('jui-not-active').addClass('jui-active').css('zIndex', '6');	
		};
		
		//opts.cssBefore = { top: 0, left: 0 };
	}
};

$.fn.countdownui.animate = function( $elem, opts ) {

	var $activeElem = $elem.find('p.jui-active'),	
		$inactiveElem = $elem.find('p.jui-not-active'),
		fn = function() {
			$activeElem.animate( opts.animOut, opts.speedOut, opts.easeOut, function() {
				opts.cb();
			});
		};
	
	$activeElem.css(opts.cssBefore);
	
	$inactiveElem.html( opts.timeLeft + ' ' + opts.timeText );
	
	$inactiveElem.show().animate( opts.animIn, opts.speedIn, opts.easeIn, function() {
		
		$inactiveElem.css(opts.cssAfter);
		
		if ( !opts.sync ) {
			fn();
		}
	});
	
	if ( opts.sync ) {
		fn();
	}
};
   
})(jQuery);