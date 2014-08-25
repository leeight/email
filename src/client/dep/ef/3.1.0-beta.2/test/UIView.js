define(function (require) {
    var UIView = require('ef/UIView');
    var template = require('er/template');

    require('er/tpl!./tpl/plain.tpl');

    describe('UIView', function () {
        it('should be a constructor', function () {
            expect(UIView).toBeOfType('function');
        });

        it('should be instantiable', function () {
            expect(new UIView()).toBeOfType('object');
        });

        describe('when rendered', function () {
            var view = new UIView();
            view.container = 'container';
            view.template = 'plain';
            view.render();
            
            it ('should merge the template specified with `template` property', function () {
                expect(container.innerHTML).toContain('\nabc');
                view.dispose();
            });
        });
    });
});