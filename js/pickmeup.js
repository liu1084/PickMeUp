/**
 * @package   PickMeUp
 * @author    Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @author    Stefan Petre <www.eyecon.ro>
 * @copyright Copyright (c) 2013-2016, Nazar Mokrynskyi
 * @copyright Copyright (c) 2008-2009, Stefan Petre
 * @license   MIT License, see license.txt
 */

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		//noinspection JSUnresolvedFunction
		define(factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = factory();
	} else {
		// Browser globals
		root.pickmeup = factory();
	}
}(this, function () {
	/**
	 * Functions prefixed with `dom_` are simple convenient wrappers for various operations with DOM
	 */

	/**
	 * @param {(Element|NodeList)} element
	 * @param {Function}           callback
	 * @param {*}                  [args=[]]
	 */
	function dom_for_collection (element, callback, args) {
		args = args || [];
		if (element instanceof Element) {
			callback.apply(callback, [element].concat(args));
		} else {
			var elements, i;
			elements = element.length;
			for (i = 0; i < elements; ++i) {
				callback.apply(callback, [element[i]].concat(args));
			}
		}
	}

	/**
	 * @param {(Element|Element[]|NodeList)} element
	 */
	function dom_remove (element) {
		dom_for_collection(element, function (element) {
			element.parentElement.removeChild(element);
		});
	}

	/**
	 * @param {Element} element
	 * @param {string}  selector
	 *
	 * @returns {Element}
	 */
	function dom_closest_parent (element, selector) {
		var parent = element;
		do {
			parent = parent.parentElement;
		} while (parent && !dom_matches(parent, selector));
		return parent;
	}

	/**
	 * @param {Element} element
	 * @param {string}  selector
	 *
	 * @returns {boolean}
	 */
	function dom_matches (element, selector) {
		return (element.matches || element.webkitMatchesSelector || element.msMatchesSelector).call(element, selector);
	}

	/**
	 * @param {Element} element
	 * @param {string}  class_name
	 *
	 * @returns {boolean}
	 */
	function dom_has_class (element, class_name) {
		return element && element.classList.contains(class_name);
	}

	/**
	 * @param {Element} element
	 * @param {string}  class_name
	 */
	function dom_add_class (element, class_name) {
		element.classList.add(class_name);
	}

	/**
	 * @param {Element} element
	 * @param {string}  class_name
	 */
	function dom_remove_class (element, class_name) {
		element.classList.remove(class_name);
	}

	/**
	 * @param {Element} element
	 * @param {string}  selector
	 *
	 * @returns {Element}
	 */
	function dom_query (element, selector) {
		return element.querySelector(selector);
	}

	/**
	 * @param {Element} element
	 * @param {string}  selector
	 *
	 * @returns {Element[]}
	 */
	function dom_query_all (element, selector) {
		return Array.prototype.slice.call(element.querySelectorAll(selector));
	}

	/**
	 * @param {Element}          pickmeup
	 * @param {(Element|Window)} target
	 * @param {string}           event
	 * @param {Function}         callback
	 */
	function dom_on (pickmeup, target, event, callback) {
		if (event.indexOf(' ') !== -1) {
			var events        = event.split(' '),
				events_number = events.length,
				i;
			for (i = 0; i < events_number; ++i) {
				dom_on(pickmeup, target, events[i], callback)
			}
		} else {
			pickmeup.__pickmeup.events.push([target, event, callback]);
			target.addEventListener(event, callback);
		}
	}

	/**
	 * @param {Element}          pickmeup
	 * @param {(Element|Window)} [target=undefined]
	 * @param {string}           [event='']
	 * @param {Function}         [callback=undefined]
	 */
	function dom_off (pickmeup, target, event, callback) {
		var events,
			events_number,
			i;
		if (event.indexOf(' ') !== -1) {
			events        = event.split(' ');
			events_number = events.length;
			for (i = 0; i < events_number; ++i) {
				dom_off(pickmeup, target, events[i], callback)
			}
		} else {
			events        = pickmeup.__pickmeup.events;
			events_number = events.length;
			for (i = 0; i < events_number; ++i) {
				if (
					(target && target != events[i][0]) ||
					(event && event != events[i][1]) ||
					(callback && callback != events[i][2])
				) {
					continue;
				}
				events[i][0].removeEventListener(events[i][1], events[i][2]);
			}
		}
	}

	/**
	 * @param {Element} element
	 *
	 * @returns {{top: number, left: number}}
	 */
	function dom_offset (element) {
		var rect = element.getBoundingClientRect();
		return {
			top  : rect.top + window.pageYOffset - document.documentElement.clientTop,
			left : rect.left + window.pageXOffset - document.documentElement.clientLeft
		};
	}

	/**
	 * @param {Element} element
	 * @param {string}  event
	 * @param {Object}  [detail=undefined]
	 *
	 * @return {boolean}
	 */
	function dom_dispatch_event (element, event, detail) {
		var e = document.createEvent('Event');
		if (detail) {
			e.detail = detail;
		}
		e.initEvent('pickmeup-' + event, false, true);
		return element.dispatchEvent(e);
	}

	/**
	 * Functions prefixed with `date_` are simple convenient wrappers for various operations with dates
	 */

	/**
	 * @param {Date} date
	 *
	 * @returns {number}
	 */
	function date_get_max_days (date) {
		var tmpDate = new Date(date),
			d       = 28,
			m       = tmpDate.getMonth();
		while (tmpDate.getMonth() == m) {
			++d;
			tmpDate.setDate(d);
		}
		return d - 1;
	}

	/**
	 * @param {Date}   date
	 * @param {number} number_of_days
	 */
	function date_add_days (date, number_of_days) {
		date.setDate(date.getDate() + number_of_days);
	}

	/**
	 * @param {Date}   date
	 * @param {number} number_of_months
	 */
	function date_add_months (date, number_of_months) {
		var day = date.getDate();
		date.setDate(1);
		date.setMonth(date.getMonth() + number_of_months);
		date.setDate(Math.min(day, date_get_max_days(date)));
	}

	/**
	 * @param {Date}   date
	 * @param {number} number_of_years
	 */
	function date_add_years (date, number_of_years) {
		var day = this.getDate();
		date.setDate(1);
		date.setFullYear(thdatedates.getFullYear() + number_of_years);
		date.setDate(Math.min(day, date_get_max_days(date)));
	}

	/**
	 * @param {Date} date
	 *
	 * @returns {number}
	 */
	function date_get_day_of_the_year (date) {
		var now  = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
		var then = new Date(date.getFullYear(), 0, 0, 0, 0, 0);
		var time = now - then;
		return Math.floor(time / 24 * 60 * 60 * 1000);
	}

	function fill () {
		var pickmeup     = this.pickmeup,
			options      = pickmeup.__pickmeup.options,
			current_cal  = Math.floor(options.calendars / 2),
			actual_date  = options.date,
			current_date = options.current,
			min_date     = options.min ? new Date(options.min) : null,
			max_date     = options.max ? new Date(options.max) : null,
			local_date,
			header,
			instance,
			shown_date_from,
			shown_date_to,
			tmp_date;
		if (min_date) {
			min_date.setDate(1);
			date_add_months(min_date, 1);
			date_add_days(min_date, -1);
		}
		if (max_date) {
			max_date.setDate(1);
			date_add_months(max_date, 1);
			date_add_days(max_date, -1);
		}
		/**
		 * Remove old content except header navigation
		 */
		dom_remove(dom_query_all(pickmeup, '.pmu-instance > :not(nav)'));
		/**
		 * If several calendars should be shown
		 */
		for (var i = 0; i < options.calendars; i++) {
			local_date = new Date(current_date);
			reset_time(local_date);
			instance = dom_query_all(pickmeup, '.pmu-instance')[i];
			if (dom_has_class(pickmeup, 'pmu-view-years')) {
				date_add_years(local_date, (i - current_cal) * 12);
				header = (local_date.getFullYear() - 6) + ' - ' + (local_date.getFullYear() + 5);
			} else if (dom_has_class(pickmeup, 'pmu-view-months')) {
				date_add_years(local_date, i - current_cal);
				header = local_date.getFullYear();
			} else if (dom_has_class(pickmeup, 'pmu-view-days')) {
				date_add_months(local_date, i - current_cal);
				header = formatDate(local_date, options.title_format, options.locale);
			}
			if (!shown_date_to) {
				if (max_date) {
					// If all dates in this month (months in year or years in years block) are after max option - set next month as current
					// in order not to show calendar with all disabled dates
					tmp_date = new Date(local_date);
					if (options.select_day) {
						date_add_months(tmp_date, options.calendars - 1);
					} else if (options.select_month) {
						date_add_years(tmp_date, options.calendars - 1);
					} else {
						date_add_years(tmp_date, (options.calendars - 1) * 12);
					}
					if (tmp_date > max_date) {
						--i;
						date_add_months(current_date, -1);
						shown_date_to = undefined;
						continue;
					}
				}
			}
			shown_date_to = new Date(local_date);
			if (!shown_date_from) {
				shown_date_from = new Date(local_date);
				// If all dates in this month are before min option - set next month as current in order not to show calendar with all disabled dates
				shown_date_from.setDate(1);
				date_add_months(shown_date_from, 1);
				date_add_days(shown_date_from, -1);
				if (min_date && min_date > shown_date_from) {
					--i;
					date_add_months(current_date, 1);
					shown_date_from = undefined;
					continue;
				}
			}
			dom_query(instance, '.pmu-month').textContent = header;
			var is_year_selected                          = function (year) {
				return (
						options.mode == 'range' &&
						year >= new Date(actual_date[0]).getFullYear() &&
						year <= new Date(actual_date[1]).getFullYear()
					) ||
					(
						options.mode == 'multiple' &&
						actual_date.reduce(function (prev, current) {
							prev.push(new Date(current).getFullYear());
							return prev;
						}, []).indexOf(year) !== -1
					) ||
					new Date(actual_date).getFullYear() == year;
			};
			var is_months_selected                        = function (year, month) {
				var first_year  = new Date(actual_date[0]).getFullYear(),
					lastyear    = new Date(actual_date[1]).getFullYear(),
					first_month = new Date(actual_date[0]).getMonth(),
					last_month  = new Date(actual_date[1]).getMonth();
				return (
						options.mode == 'range' &&
						year > first_year &&
						year < lastyear
					) ||
					(
						options.mode == 'range' &&
						year == first_year &&
						year < lastyear &&
						month >= first_month
					) ||
					(
						options.mode == 'range' &&
						year > first_year &&
						year == lastyear &&
						month <= last_month
					) ||
					(
						options.mode == 'range' &&
						year == first_year &&
						year == lastyear &&
						month >= first_month &&
						month <= last_month
					) ||
					(
						options.mode == 'multiple' &&
						actual_date.reduce(function (prev, current) {
							current = new Date(current);
							prev.push(current.getFullYear() + '-' + current.getMonth());
							return prev;
						}, []).indexOf(year + '-' + month) !== -1
					) ||
					(
						new Date(actual_date).getFullYear() == year &&
						new Date(actual_date).getMonth() == month
					)
			};
			(function () {
				var years_elements  = [],
					start_from_year = local_date.getFullYear() - 6,
					min_year        = new Date(options.min).getFullYear(),
					max_year        = new Date(options.max).getFullYear(),
					year,
					year_element,
					j;
				for (j = 0; j < 12; ++j) {
					year                         = start_from_year + j;
					year_element                 = document.createElement('div');
					year_element.textContent     = year;
					year_element.__pickmeup_year = year;
					if (
						(options.min && year < min_year) ||
						(options.max && year > max_year)
					) {
						dom_add_class(year_element, 'pmu-disabled');
					} else if (is_year_selected(year)) {
						dom_add_class(year_element, 'pmu-selected');
					}
					years_elements.push(year_element);
				}
				instance.appendChild(options.instance_content_template(years_elements, 'pmu-years'));
			})();
			(function () {
				var months_elements = [],
					current_year    = local_date.getFullYear(),
					min_year        = new Date(options.min).getFullYear(),
					min_month       = new Date(options.min).getMonth(),
					max_year        = new Date(options.max).getFullYear(),
					max_month       = new Date(options.max).getMonth(),
					month,
					month_element;
				for (month = 0; month < 12; ++month) {
					month_element                  = document.createElement('div');
					month_element.textContent      = options.locale.monthsShort[month];
					month_element.__pickmeup_month = month;
					month_element.__pickmeup_year  = current_year;
					if (
						(
							options.min &&
							(
								current_year < min_year ||
								(
									month < min_month && current_year == min_year
								)
							)
						) ||
						(
							options.max &&
							(
								current_year > max_year ||
								(
									month > max_month && current_year >= max_year
								)
							)
						)
					) {
						dom_add_class(month_element, 'pmu-disabled');
					} else if (is_months_selected(current_year, month)) {
						dom_add_class(month_element, 'pmu-selected');
					}
					months_elements.push(month_element);
				}
				instance.appendChild(options.instance_content_template(months_elements, 'pmu-months'));
			})();
			(function () {
				var days_elements = [],
					current_month = local_date.getMonth(),
					today         = reset_time(new Date).valueOf(),
					day,
					day_element,
					from_user,
					val,
					disabled;
				// Correct first day in calendar taking into account the first day of the week (Sunday or Monday)
				(function () {
					local_date.setDate(1);
					var day = (local_date.getDay() - options.first_day) % 7;
					date_add_days(local_date, -(day + (day < 0 ? 7 : 0)));
				})();
				for (day = 0; day < 42; ++day) {
					day_element                  = document.createElement('div');
					day_element.textContent      = local_date.getDate();
					day_element.__pickmeup_day   = local_date.getDate();
					day_element.__pickmeup_month = local_date.getMonth();
					day_element.__pickmeup_year  = local_date.getFullYear();
					if (current_month != local_date.getMonth()) {
						dom_add_class(day_element, 'pmu-not-in-month');
					}
					if (local_date.getDay() == 0) {
						dom_add_class(day_element, 'pmu-sunday');
					} else if (local_date.getDay() == 6) {
						dom_add_class(day_element, 'pmu-saturday');
					}
					from_user = options.render(new Date(local_date)) || {};
					val       = local_date.valueOf();
					disabled  = (options.min && options.min > local_date) || (options.max && options.max < local_date);
					if (from_user.disabled || disabled) {
						dom_add_class(day_element, 'pmu-disabled');
					} else if (
						from_user.selected ||
						options.date.valueOf() == val ||
						(
							options.date instanceof Array &&
							options.date.reduce(function (prev, date) {
								return prev || val === date.valueOf();
							}, false)
						) ||
						(
							options.mode == 'range' && val >= options.date[0] && val <= options.date[1]
						)
					) {
						dom_add_class(day_element, 'pmu-selected');
					}
					if (val == today) {
						dom_add_class(day_element, 'pmu-today');
					}
					if (from_user.class_name) {
						from_user.class_name.split(' ').forEach(
							dom_add_class.bind(day_element, day_element)
						);
					}
					days_elements.push(day_element);
					// Move to the next day
					date_add_days(local_date, 1);
				}
				instance.appendChild(options.instance_content_template(days_elements, 'pmu-days'));
			})();
		}
		shown_date_from.setDate(1);
		shown_date_to.setDate(1);
		date_add_months(shown_date_to, 1);
		date_add_days(shown_date_to, -1);
		var prev = dom_query(pickmeup, '.pmu-prev'),
			next = dom_query(pickmeup, '.pmu-next');
		if (prev) {
			prev.style.visibility = options.min && options.min >= shown_date_from ? 'hidden' : 'visible';
		}
		if (next) {
			next.style.visibility = options.max && options.max <= shown_date_to ? 'hidden' : 'visible';
		}
		dom_dispatch_event(pickmeup, 'fill');
	}

	function parseDate (date, format, separator, locale) {
		var i;
		if (date instanceof Date || date instanceof Number) {
			return reset_time(new Date(date));
		} else if (!date) {
			return reset_time(new Date);
		} else if (date instanceof Array) {
			date = date.slice();
			for (i = 0; i < date.length; ++i) {
				date[i] = parseDate(date[i], format, separator, locale);
			}
			return date;
		}
		var splitted_date = date.split(separator);
		if (splitted_date.length > 1) {
			splitted_date.forEach(function (element, index, array) {
				array[index] = parseDate(element.trim(), format, separator, locale);
			});
			return splitted_date;
		}
		var months_text = locale.monthsShort.join(')(') + ')(' + locale.months.join(')(');
		separator       = new RegExp('[^0-9a-zA-Z(' + months_text + ')]+');
		var parts       = date.split(separator),
			against     = format.split(separator),
			d,
			m,
			y,
			h,
			min,
			now         = new Date();
		for (i = 0; i < parts.length; i++) {
			switch (against[i]) {
				case 'b':
					m = locale.monthsShort.indexOf(parts[i]);
					break;
				case 'B':
					m = locale.months.indexOf(parts[i]);
					break;
				case 'd':
				case 'e':
					d = parseInt(parts[i], 10);
					break;
				case 'm':
					m = parseInt(parts[i], 10) - 1;
					break;
				case 'Y':
				case 'y':
					y = parseInt(parts[i], 10);
					y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
					break;
				case 'H':
				case 'I':
				case 'k':
				case 'l':
					h = parseInt(parts[i], 10);
					break;
				case 'P':
				case 'p':
					if (/pm/i.test(parts[i]) && h < 12) {
						h += 12;
					} else if (/am/i.test(parts[i]) && h >= 12) {
						h -= 12;
					}
					break;
				case 'M':
					min = parseInt(parts[i], 10);
					break;
			}
		}
		var parsed_date = new Date(
			y === undefined ? now.getFullYear() : y,
			m === undefined ? now.getMonth() : m,
			d === undefined ? now.getDate() : d,
			h === undefined ? now.getHours() : h,
			min === undefined ? now.getMinutes() : min,
			0
		);
		if (isNaN(parsed_date * 1)) {
			parsed_date = new Date;
		}
		return reset_time(parsed_date);
	}

	function reset_time (date) {
		date.setHours(0, 0, 0, 0);
		return date;
	}

	function formatDate (date, format, locale) {
		var m  = date.getMonth();
		var d  = date.getDate();
		var y  = date.getFullYear();
		var w  = date.getDay();
		var s  = {};
		var hr = date.getHours();
		var pm = (hr >= 12);
		var ir = (pm) ? (hr - 12) : hr;
		var dy = date_get_day_of_the_year(date);
		if (ir == 0) {
			ir = 12;
		}
		var min   = date.getMinutes();
		var sec   = date.getSeconds();
		var parts = format.split(''), part;
		for (var i = 0; i < parts.length; i++) {
			part = parts[i];
			switch (part) {
				case 'a':
					part = locale.daysShort[w];
					break;
				case 'A':
					part = locale.days[w];
					break;
				case 'b':
					part = locale.monthsShort[m];
					break;
				case 'B':
					part = locale.months[m];
					break;
				case 'C':
					part = 1 + Math.floor(y / 100);
					break;
				case 'd':
					part = (d < 10) ? ("0" + d) : d;
					break;
				case 'e':
					part = d;
					break;
				case 'H':
					part = (hr < 10) ? ("0" + hr) : hr;
					break;
				case 'I':
					part = (ir < 10) ? ("0" + ir) : ir;
					break;
				case 'j':
					part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
					break;
				case 'k':
					part = hr;
					break;
				case 'l':
					part = ir;
					break;
				case 'm':
					part = (m < 9) ? ("0" + (1 + m)) : (1 + m);
					break;
				case 'M':
					part = (min < 10) ? ("0" + min) : min;
					break;
				case 'p':
				case 'P':
					part = pm ? "PM" : "AM";
					break;
				case 's':
					part = Math.floor(date.getTime() / 1000);
					break;
				case 'S':
					part = (sec < 10) ? ("0" + sec) : sec;
					break;
				case 'u':
					part = w + 1;
					break;
				case 'w':
					part = w;
					break;
				case 'y':
					part = ('' + y).substr(2, 2);
					break;
				case 'Y':
					part = y;
					break;
			}
			parts[i] = part;
		}
		return parts.join('');
	}

	function update_date (new_date) {
		var pickmeup = this.pickmeup,
			options  = pickmeup.__pickmeup.options,
			i;
		reset_time(new_date);
		(function () {
			var new_value;
			switch (options.mode) {
				case 'multiple':
					new_value = new_date.valueOf();
					for (i = 0; i < options.date.length; ++i) {
						if (options.date[i].valueOf() === new_value) {
							options.date.splice(i, 1);
							return;
						}
					}
					options.date.push(new_date);
					break;
				case 'range':
					if (!options.lastSel) {
						options.date[0] = new_date;
					}
					if (new_date <= options.date[0]) {
						options.date[1] = options.date[0];
						options.date[0] = new_date;
					} else {
						options.date[1] = new_date;
					}
					options.lastSel = !options.lastSel;
					break;
				default:
					options.date = new_date.valueOf();
					break;
			}
		})();
		var prepared_date = prepareDate(options);
		if (dom_matches(this, 'input')) {
			this.value = options.mode == 'single' ? prepared_date.formatted_date : prepared_date.formatted_date.join(options.separator);
		}
		dom_dispatch_event(pickmeup, 'change', prepared_date);
		if (
			!options.flat &&
			options.hide_on_select &&
			(
				options.mode != 'range' || !options.lastSel
			)
		) {
			options.binded.hide();
			return false;
		}
	}

	function click (e) {
		var element = e.target;
		if (!dom_has_class(element, 'pmu-button')) {
			element = dom_closest_parent(element, '.pmu-button');
		}
		if (!dom_has_class(element, 'pmu-button') || dom_has_class(element, 'pmu-disabled')) {
			return false;
		}
		var options        = this.pickmeup.__pickmeup.options,
			instance       = dom_closest_parent(element, '.pmu-instance'),
			root           = instance.parentElement,
			instance_index = dom_query_all(root, '.pmu-instance').indexOf(instance);
		if (dom_matches(element.parentElement, 'nav')) {
			if (dom_has_class(element, 'pmu-month')) {
				date_add_months(options.current, instance_index - Math.floor(options.calendars / 2));
				if (dom_has_class(root, 'pmu-view-years')) {
					// Shift back to current date, otherwise with min value specified may jump on few (tens) years forward
					if (options.mode != 'single') {
						options.current = new Date(options.date[options.date.length - 1]);
					} else {
						options.current = new Date(options.date);
					}
					if (options.select_day) {
						dom_remove_class(root, 'pmu-view-years');
						dom_add_class(root, 'pmu-view-days');
					} else if (options.select_month) {
						dom_remove_class(root, 'pmu-view-years');
						dom_add_class(root, 'pmu-view-months');
					}
				} else if (dom_has_class(root, 'pmu-view-months')) {
					if (options.select_year) {
						dom_remove_class(root, 'pmu-view-months');
						dom_add_class(root, 'pmu-view-years');
					} else if (options.select_day) {
						dom_remove_class(root, 'pmu-view-months');
						dom_add_class(root, 'pmu-view-days');
					}
				} else if (dom_has_class(root, 'pmu-view-days')) {
					if (options.select_month) {
						dom_remove_class(root, 'pmu-view-days');
						dom_add_class(root, 'pmu-view-months');
					} else if (options.select_year) {
						dom_remove_class(root, 'pmu-view-days');
						dom_add_class(root, 'pmu-view-years');
					}
				}
			} else {
				if (dom_has_class(element, 'pmu-prev')) {
					options.binded.prev(false);
				} else {
					options.binded.next(false);
				}
			}
		} else {
			if (dom_has_class(root, 'pmu-view-years')) {
				options.current.setFullYear(element.__pickmeup_year);
				if (options.select_month) {
					dom_remove_class(root, 'pmu-view-years');
					dom_add_class(root, 'pmu-view-months');
				} else if (options.select_day) {
					dom_remove_class(root, 'pmu-view-years');
					dom_add_class(root, 'pmu-view-days');
				} else {
					options.binded.update_date(options.current);
				}
			} else if (dom_has_class(root, 'pmu-view-months')) {
				options.current.setMonth(element.__pickmeup_month);
				options.current.setFullYear(element.__pickmeup_year);
				if (options.select_day) {
					dom_remove_class(root, 'pmu-view-months');
					dom_add_class(root, 'pmu-view-days');
				} else {
					options.binded.update_date(options.current);
				}
				// Move current month to the first place (needed for multiple calendars)
				date_add_months(options.current, Math.floor(options.calendars / 2) - instance_index);
			} else {
				var new_date = new Date(options.current);
				new_date.setYear(element.__pickmeup_year);
				new_date.setMonth(element.__pickmeup_month);
				new_date.setDate(element.__pickmeup_day);
				options.binded.update_date(new_date);
			}
		}
		options.binded.fill();
		return true;
	}

	function prepareDate (options) {
		var result;
		if (options.mode == 'single') {
			result = new Date(options.date);
			return {
				formatted_date : formatDate(result, options.format, options.locale),
				date           : result
			};
		} else {
			result = {
				formatted_date : [],
				date           : []
			};
			options.date.forEach(function (val) {
				var date = new Date(val);
				result.formatted_date.push(formatDate(date, options.format, options.locale));
				result.date.push(date);
			});
			return result;
		}
	}

	function show (force) {
		var pickmeup = this.pickmeup,
			value;
		if (force || dom_has_class(pickmeup, 'pmu-hidden')) {
			var options  = pickmeup.__pickmeup.options,
				pos      = dom_offset(this),
				viewport = {
					l : window.pageXOffset,
					t : window.pageYOffset,
					w : document.documentElement.clientWidth,
					h : document.documentElement.clientHeight
				},
				top      = pos.top,
				left     = pos.left;
			options.binded.fill();
			if (dom_matches(this, 'input')) {
				value = this.value;
				if (value) {
					options.binded.set_date(value);
				}
				dom_on(
					pickmeup,
					this,
					'keydown',
					function (e) {
						if (e.which == 9) {
							options.binded.hide();
						}
					}
				);
				options.lastSel = false;
			}
			if (!dom_dispatch_event(pickmeup, 'show')) {
				return;
			}
			if (!options.flat) {
				switch (options.position) {
					case 'top':
						top -= pickmeup.offsetHeight;
						break;
					case 'left':
						left -= pickmeup.offsetWidth;
						break;
					case 'right':
						left += this.offsetWidth;
						break;
					case 'bottom':
						top += this.offsetHeight;
						break;
				}
				if (top + pickmeup.offsetHeight > viewport.t + viewport.h) {
					top = pos.top - pickmeup.offsetHeight;
				}
				if (top < viewport.t) {
					top = pos.top + this.offsetHeight;
				}
				if (left + pickmeup.offsetWidth > viewport.l + viewport.w) {
					left = pos.left - pickmeup.offsetWidth;
				}
				if (left < viewport.l) {
					left = pos.left + this.offsetWidth
				}
				pickmeup.style.top  = top + 'px';
				pickmeup.style.left = left + 'px';
				dom_remove_class(pickmeup, 'pmu-hidden');
				dom_on(pickmeup, document.documentElement, 'click', options.binded.hide);
				dom_on(pickmeup, window, 'resize', options.binded.forced_show);
			}
		}
	}

	function forced_show () {
		show.call(this, true);
	}

	function hide (e) {
		//noinspection JSBitwiseOperatorUsage
		if (
			!e || !e.target ||											//Called directly
			(
				e.target != this &&										//Clicked not on element itself
				!(this.pickmeup.compareDocumentPosition(e.target) & 16)	//And not on its children
			)
		) {
			var pickmeup = this.pickmeup,
				options  = pickmeup.__pickmeup.options;
			if (dom_dispatch_event(pickmeup, 'hide')) {
				dom_add_class(pickmeup, 'pmu-hidden');
				dom_off(pickmeup, document.documentElement, 'click', options.binded.hide);
				dom_off(pickmeup, window, 'resize', options.binded.forced_show);
				options.lastSel = false;
			}
		}
	}

	function update () {
		var pickmeup = this.pickmeup,
			options  = pickmeup.__pickmeup.options;
		dom_off(pickmeup, document.documentElement, 'click', options.binded.hide);
		dom_off(pickmeup, window, 'resize', options.binded.forced_show);
		options.binded.forced_show();
	}

	function clear () {
		var options = this.pickmeup.__pickmeup.options;
		if (options.mode != 'single') {
			options.date    = [];
			options.lastSel = false;
			options.binded.fill();
		}
	}

	function prev (fill) {
		if (typeof fill == 'undefined') {
			fill = true;
		}
		var pickmeup = this.pickmeup;
		var options  = pickmeup.__pickmeup.options;
		if (dom_has_class(pickmeup, 'pmu-view-years')) {
			date_add_years(options.current, -12);
		} else if (dom_has_class(pickmeup, 'pmu-view-months')) {
			date_add_years(options.current, -1);
		} else if (dom_has_class(pickmeup, 'pmu-view-days')) {
			date_add_months(options.current, -1);
		}
		if (fill) {
			options.binded.fill();
		}
	}

	function next (fill) {
		if (typeof fill == 'undefined') {
			fill = true;
		}
		var pickmeup = this.pickmeup;
		var options  = pickmeup.__pickmeup.options;
		if (dom_has_class(pickmeup, 'pmu-view-years')) {
			date_add_years(options.current, 12);
		} else if (dom_has_class(pickmeup, 'pmu-view-months')) {
			date_add_years(options.current, 1);
		} else if (dom_has_class(pickmeup, 'pmu-view-days')) {
			date_add_months(options.current, 1);
		}
		if (fill) {
			options.binded.fill();
		}
	}

	function get_date (formatted) {
		var options       = this.pickmeup.__pickmeup.options,
			prepared_date = prepareDate(options);
		if (typeof formatted === 'string') {
			var date = prepared_date.date;
			if (date instanceof Date) {
				return formatDate(date, formatted, options.locale)
			} else {
				return date.map(function (value) {
					return formatDate(value, formatted, options.locale);
				});
			}
		} else {
			return prepared_date[formatted ? 'formatted_date' : 'date'];
		}
	}

	function set_date (date, current) {
		var options = this.pickmeup.__pickmeup.options,
			i;
		if (!(date instanceof Array) || date.length > 0) {
			options.date = parseDate(date, options.format, options.separator, options.locale);
			if (options.mode != 'single') {
				if (options.date instanceof Array) {
					options.date[0] = options.date[0] || parseDate(new Date, options.format, options.separator, options.locale);
					if (options.mode == 'range') {
						options.date[1] = options.date[1] || parseDate(options.date[0], options.format, options.separator, options.locale);
					}
				} else {
					options.date = [options.date];
					if (options.mode == 'range') {
						options.date.push(parseDate(options.date[0], options.format, options.separator, options.locale));
					}
				}
				for (i = 0; i < options.date.length; ++i) {
					options.date[i] = correct_date_outside_of_limit(options.date[i], options.min, options.max);
				}
			} else {
				if (options.date instanceof Array) {
					options.date = options.date[0];
				}
				options.date = correct_date_outside_of_limit(options.date, options.min, options.max);
			}
		} else {
			options.date = [];
		}
		if (!options.select_day) {
			if (options.date instanceof Array) {
				for (i = 0; i < options.date.length; ++i) {
					options.date[i].setDate(1);
				}
			} else {
				options.date.setDate(1);
			}
		}
		// Remove duplicates
		if (options.mode == 'multiple') {
			for (i = 0; i < options.date.length; ++i) {
				if (options.date.indexOf(options.date[i]) !== i) {
					options.date.splice(i, 1);
					--i;
				}
			}
		}
		if (current) {
			options.current = parseDate(current, options.format, options.separator, options.locale);
		} else {
			current         = options.mode === 'single' ? options.date : options.date[options.date.length - 1];
			options.current = current ? new Date(current) : new Date;
		}
		options.current.setDate(1);
		options.binded.fill();
		if (dom_matches(this, 'input') && options.default_date !== false) {
			var prepared_date = prepareDate(options),
				current_value = this.value,
				new_value     = options.mode == 'single' ? prepared_date.formatted_date : prepared_date.formatted_date.join(options.separator);
			if (!current_value) {
				dom_dispatch_event(pickmeup, 'change', prepared_date);
			}
			if (current_value != new_value) {
				this.value = new_value;
			}
		}
	}

	function destroy () {
		var pickmeup = this.pickmeup;
		dom_off(pickmeup);
		dom_remove(this.pickmeup);
		delete this.pickmeup.__pickmeup;
		delete this.pickmeup;
	}

	function correct_date_outside_of_limit (date, min, max) {
		if (min && min > date) {
			return new Date(min);
		} else if (max && max < date) {
			return new Date(max);
		}
		return date;
	}

	/**
	 * @param {(Element|string)} element
	 * @param {Object}           [initial_options={}]
	 */
	function pickmeup_init (element, initial_options) {
		if (typeof element == 'string') {
			element = document.querySelector(element);
		}
		if (!element.pickmeup) {
			var i,
				option,
				options = {};
			for (i in pickmeup_init.defaults) {
				options[i] = i in initial_options ? initial_options[i] : pickmeup_init.defaults[i];
			}
			for (i in options) {
				option = element.getAttribute('pmu-' + i);
				if (option !== null) {
					options[i] = option;
				}
			}
			// 4 conditional statements in order to account all cases
			if (options.view == 'days' && !options.select_day) {
				options.view = 'months';
			}
			if (options.view == 'months' && !options.select_month) {
				options.view = 'years';
			}
			if (options.view == 'years' && !options.select_year) {
				options.view = 'days';
			}
			if (options.view == 'days' && !options.select_day) {
				options.view = 'months';
			}
			options.calendars = Math.max(1, parseInt(options.calendars, 10) || 1);
			options.mode      = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
			if (options.min) {
				options.min = parseDate(options.min, options.format, options.separator, options.locale);
				if (!options.select_day) {
					options.min.setDate(1);
				}
			}
			if (options.max) {
				options.max = parseDate(options.max, options.format, options.separator, options.locale);
				if (!options.select_day) {
					options.max.setDate(1);
				}
			}
			var pickmeup        = document.createElement('div');
			element.pickmeup    = pickmeup;
			pickmeup.__pickmeup = {
				options : options,
				events  : []
			};
			dom_add_class(pickmeup, 'pickmeup');
			if (options.class_name) {
				dom_add_class(pickmeup, options.class_name);
			}
			options.binded = {
				fill        : fill.bind(element),
				update_date : update_date.bind(element),
				click       : click.bind(element),
				show        : show.bind(element),
				forced_show : forced_show.bind(element),
				hide        : hide.bind(element),
				update      : update.bind(element),
				clear       : clear.bind(element),
				prev        : prev.bind(element),
				next        : next.bind(element),
				get_date    : get_date.bind(element),
				set_date    : set_date.bind(element),
				destroy     : destroy.bind(element)
			};
			dom_add_class(pickmeup, 'pmu-view-' + options.view);
			pickmeup.innerHTML = options.instance_template(options).repeat(options.calendars);
			dom_on(pickmeup, pickmeup, 'click', options.binded.click);
			dom_on(
				pickmeup,
				pickmeup,
				'onselectstart' in Element.prototype ? 'selectstart' : 'mousedown',
				function (e) {
					e.preventDefault();
				});
			if (options.flat) {
				dom_add_class(pickmeup, 'pmu-flat');
				element.appendChild(pickmeup);
			} else {
				dom_add_class(pickmeup, 'pmu-hidden');
				document.body.appendChild(pickmeup);
				dom_on(
					pickmeup,
					element,
					'click',
					function () {
						options.binded.show();
					}
				);
				dom_on(pickmeup, element, 'input', options.binded.update);
				dom_on(pickmeup, element, 'change', options.binded.update);
			}
			options.binded.set_date(options.date, options.current);
		}
		options = element.pickmeup.__pickmeup.options;
		return {
			hide     : options.binded.hide,
			show     : options.binded.hide,
			clear    : options.binded.hide,
			update   : options.binded.hide,
			prev     : options.binded.hide,
			next     : options.binded.hide,
			destroy  : options.binded.hide,
			get_date : options.binded.get_date,
			set_date : options.binded.set_date
		}
	}

	pickmeup_init.defaults = {
		current                   : null,
		date                      : new Date,
		default_date              : new Date,
		flat                      : false,
		first_day                 : 1,
		prev                      : '&#9664;',
		next                      : '&#9654;',
		mode                      : 'single',
		select_year               : true,
		select_month              : true,
		select_day                : true,
		view                      : 'days',
		calendars                 : 1,
		format                    : 'd-m-Y',
		title_format              : 'B, Y',
		position                  : 'bottom',
		class_name                : '',
		separator                 : ' - ',
		hide_on_select            : false,
		min                       : null,
		max                       : null,
		render                    : function () {
		},
		locale                    : {
			days        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			daysShort   : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			daysMin     : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			months      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			monthsShort : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		/**
		 * @param {Object} options
		 * @returns {string}
		 */
		instance_template         : function (options) {
			var days_of_week = options.locale.daysMin.slice();
			// If Monday is the first day of the week
			if (options.first_day) {
				days_of_week.push(days_of_week.shift());
			}
			return '<div class="pmu-instance">' +
				'<nav>' +
				'<div class="pmu-prev pmu-button">' + options.prev + '</div>' +
				'<div class="pmu-month pmu-button"></div>' +
				'<div class="pmu-next pmu-button">' + options.next + '</div>' +
				'</nav>' +
				'<nav class="pmu-day-of-week"><div>' + days_of_week.join('</div><div>') + '</div></nav>' +
				'</div>';
		},
		/**
		 * @param {Element[]} elements
		 * @param {string}    container_class_name
		 * @returns {Element}
		 */
		instance_content_template : function (elements, container_class_name) {
			var root_element = document.createElement('div');
			dom_add_class(root_element, container_class_name);
			for (var i = 0; i < elements.length; ++i) {
				dom_add_class(elements[i], 'pmu-button');
				root_element.appendChild(elements[i]);
			}
			return root_element;
		}
	};

	return pickmeup_init;
}));
