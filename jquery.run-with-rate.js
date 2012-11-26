/**
 * jQuery Run with a rate Plugin
 *
 * <p>Reimplemented in JavaScript, something like Sub::Rate</p>
 * http://search.cpan.org/~typester/Sub-Rate-0.04/lib/Sub/Rate.pm
 * https://github.com/typester/Sub-Rate
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function(global, $, undefined) {

    /**
     * Greatest common divisor using Josef Stein's algorithm
     * 
     * @param {Number[]} An integer greater than zero.
     * @return {Number} Greatest common divisor.
     * @see <a href="http://commons.apache.org/math/apidocs/org/apache/commons/math3/util/ArithmeticUtils.html#gcd(int, int)">ArithmeticUtils#gcd</a>
     * @see <a href="http://en.wikipedia.org/wiki/Binary_GCD_algorithm">Binary GCD algorithm</a>
     */
    function gcd(n) {

        // Josef Stein algorithm of the GCD (greatest common divisor)
        function _gcd(u, v) {
            function isOdd(number) {
                var isOdd = ((number & 1) === 0);
                return isOdd;
            };

            if (!isFinite(u) || !(u >= 1)) {
                return NaN;
            };
            if (!isFinite(v) || !(v >= 1)) {
                return NaN;
            };

            var k = 0;
            while (isOdd(u) && isOdd(v)) {
                k++;
                u /= 2;
                v /= 2;
            };

            var t;
            if (isOdd(u)) {
                t = u / 2;
            } else {
                t = -v;
            };

            do {
                while (isOdd(t)) {
                    t /= 2;
                };
                if (t > 0) {
                    u = t;
                } else {
                    v = -t;
                };
                t = u - v;
            } while (t !== 0);

            return u * (1 << k);
        };

        // Multi-args
        function engine(n, use) {
            if (use === 2) {
                return _gcd(n[0], n[1])
            };

            return _gcd(n[n.length - 1], engine(n, use - 1));
        };

        if (!$.isArray(n)) {
            return NaN;
        };
        var length = n.length;
        if (length < 2) {
            return NaN;
        };
        var greatestCommonDivisor = engine(n, length);

        return greatestCommonDivisor;
    };

    /**
     * Execution of a plan that the weighted.
     *
     * @class ExecutionPlan
     * @property {Number} rate The rate of weight
     * @property {Function} func The Function to be executed
     */
    var ExecutionPlan = (function() {

        /**
         * Constructer
         *
         * @constructor
         * @param {Number} rate The rate of weight
         * @param {Function} func The Function to be executed
         */
        function ExecutionPlan(rate, func) {
            if (isFinite(rate) && (rate >= 1)) {
                this.rate += rate;
            };
            if (typeof func === 'function') {
                this.func = func;
            };
        };
        ExecutionPlan.prototype.rate = 0;
        ExecutionPlan.prototype.func = function() {};

        return ExecutionPlan;
    }) ();

    /**
     * Ready list of ExecutionPlan
     *
     * @class ReadyList
     * @property {ExecutionPlan[]} executionPlans
     */
    var ReadyList = (function() {

        /**
         * Constructer
         *
         * @constructor
         */
        function ReadyList() {
            this.executionPlans = [];
        };
        ReadyList.prototype.executionPlans = [];

        /**
         * Appending the given ExecutionPlan
         *
         *@param {ExecutionPlan} executionPlan
         */
        ReadyList.prototype.push = function(exectionPlan) {
            if (exectionPlan instanceof ExecutionPlan) {
                this.executionPlans.push(exectionPlan);
            };
        };

        /**
         * Returns all ExecutionPlan
         *
         * @return {ExecutionPlan[]}
         */
        ReadyList.prototype.fetch = function() {
            return this.executionPlans;
        };

        /**
         * Greatest common divisor of rates
         *
         * @return {Number} Greatest common divisor of rates
         */
        ReadyList.prototype.computeGcdOfRate = function() {
            var container = this.executionPlans;
            var rates     = [];
            for (var i = 0, l = container.length; i < l; i++) {
                var rate = container[i].rate;
                rates.push(rate)
            };
            var gcdOfRate = gcd(rates);

            return gcdOfRate;
        };

        return ReadyList;
    }) ();

    /**
     * Dispatcher
     *
     * @class ReadyList
     * @property {Functions[]} taskFunctions
     * @property {Functions[]} bufferFunctions
     */
    var Dispatcher = (function() {

        /**
         * Constructer
         *
         * @constructor
         * @param {ReadyList} readyList
         */
        function Dispatcher(readyList) {
            var executionPlans = readyList.fetch();
            var gcdOfRate      = readyList.computeGcdOfRate();
            this.taskFunctions = [];
            for (var i = 0, l = executionPlans.length; i < l; i++) {
                var rate = executionPlans[i].rate;
                if (rate > 0) {
                    rate /= gcdOfRate;
                };
                var func = executionPlans[i].func;
                for (var j = 0; j < rate; j++) {
                    this.taskFunctions.push(func);
                };
            };
            this.bufferFunctions = [];
        };

        /**
         * Trigger dispatcher
         *
         * @return {Function} Trigger the execution of each rate
         */
        Dispatcher.prototype.trigger = function() {
            var bufferFunctions = this.bufferFunctions;
            if (bufferFunctions.length === 0) {
                var origin = this.taskFunctions;
                for (var i = 0, l = origin.length; i < l ; i++) {
                    bufferFunctions.push(origin[i]);
                };
                bufferFunctions.sort(function() {
                    var a = Math.random();
                    var b = Math.random();
                    var x = 0;
                    if (a > b) {
                        x = -1;
                    } else if (a < b) {
                        x = 1
                    };
                    return x;
                });
            };

            var func = bufferFunctions.shift();

            return func;
        };

        return Dispatcher;
    }) ();

    /**
     * Run with a rate.
     *
     * @class RunWithRate
     * @property {ReadyList} readyList
     */
    var RunWithRate = (function() {

        /**
         * Constructer
         *
         * @constructor
         */
        function RunWithRate() {
            this.readyList = new ReadyList();
        };

        /**
         * Add funcion to ready list with rate.
         *
         * @param {Number} rate
         * @param {Function} func
         */
        RunWithRate.prototype.add = function(rate, func) {
            var executionPlan = new ExecutionPlan(rate, func);
            this.readyList.push(executionPlan);
        };

        /**
         * Create a new dispatcher with the weighted for rate.
         *
         * @return {Function} dispatch functions by its rates.
         */
        RunWithRate.prototype.generate = function() {
            var dispatcher = new Dispatcher(this.readyList);

            return dispatcher;
        };

        return RunWithRate;
    }) ();

    /**
     * Run with a rate.
     *
     * @return {RunWithRate} Run with a rate.
     */
    $.runWithRate = function() {
        var generator = new RunWithRate();
        return generator;
    };

}) (this, jQuery);

