(function(global, undefined) {

    /** Group related tests */
    module('jQuery Run with rate Plugin');

    var HUNDRED_THOUSAND = 100000;

    test('Runs equally', function(){
        var generator = $.runWithRate();

        var countA = 0;
        var countB = 0;
        generator.add(1, function() {
            countA++;
        });
        generator.add(1, function() {
            countB++;
        });

        var dispatcher = generator.generate();
        for (var i = 0; i < HUNDRED_THOUSAND; i++) {
            dispatcher.trigger().call();
        };

        ok((countA === countB), 'At ratio of 1-to-1, Runs equally: ' + countA + '-to-' + countB);
        ok(((countA + countB) === HUNDRED_THOUSAND), 'Completed as planned');
    });

    test('Runs with a probability of 1:2', function(){
        var generator = $.runWithRate();

        var countA = 0;
        var countB = 0;
        generator.add(1, function() {
            countA++;
        });
        generator.add(3, function() {
            countB++;
        });

        var dispatcher = generator.generate();
        for (var i = 0; i < HUNDRED_THOUSAND; i++) {
            dispatcher.trigger().call();
        };

        ok(((countA * 3) === countB), 'At ratio of 3-to-1, All run: ' + countA + '-to-' + countB);
        ok(((countA + countB) === HUNDRED_THOUSAND), 'Completed as planned');
    });

    test('Run by changing the ratio', function(){
        var generator = $.runWithRate();

        var countA = 0;
        var countB = 0;
        var countC = 0;
        generator.add(1, function() {
            countA++;
        });
        generator.add(1, function() {
            countB++;
        });
        generator.add(2, function() {
            countC++;
        });

        var dispatcher = generator.generate();
        for (var i = 0; i < HUNDRED_THOUSAND; i++) {
            dispatcher.trigger().call();
        };

        ok(((countA + countB) === countC), 'At ratio of 1-1-2, All run: ' + countA + '-' + countB + '-' + countC);
        ok(((countA + countB + countC) === HUNDRED_THOUSAND), 'Completed as planned');
    });

    test('Probability control', function(){
        var generator = $.runWithRate();

        var countA = 0;
        var countB = 0;
        generator.add(1, function() {
            countA++;
        });
        generator.add(364, function() {
            countB++;
        });

        var dispatcher = generator.generate();
        for (var i = 0; i < 365; i++) {
            dispatcher.trigger().call();
        };

        ok((countA === 1), 'Run with a probability of 1/365');
        ok((countB === 364), 'Other run');
    });
}) (this);

