(function($, _, Backbone){

    'use strict';

    var App = {};

    var AjaxFormView = Backbone.View.extend({

        el: 'form.ajax',

        currentState: '',

        stateClasses: {
            success: 'state-success',
            error: 'state-error',
            loading: 'state-loading'
        },

        events:{
            'submit' : 'submit'
        },

        initialize: function(){
            this.url = this.$el.attr('action');
        },

        setState: function(state){
            this.$el.removeClass(this.stateClasses[this.currentState]);
            this.$el.addClass(this.stateClasses[state]);

            this.currentState = state;

            // Prevent user from editing form while loading
            if(state === 'loading'){
                $('input, select, textarea', this.$el).attr('disabled', 'disabled');
            }else{
                $('input, select, textarea', this.$el).removeAttr('disabled');
            }
        },

        result: function(response, result){

            console.log(this);

            this.setState(result);

            // Publish event
            App.mediator.publish('ajaxFormLoaded', {
                result: result,
                response: response,
                $el: this.$el
            });
        },

        submit: function(e){

            // Prevent form from submitting normally
            e.preventDefault();

            var options = {
                type: 'POST',
                url: this.url,
                data: this.$el.serialize(),
                error: $.proxy(this.result, this),
                success: $.proxy(this.result, this)
            };

            // Use FormData if supported, allows sending file input data
            if(typeof window.FormData === 'function'){
                options.data = new FormData(this.el);
                options.processData = false;
                options.contentType = false;
            };

            $.ajax(options);

            this.setState('loading');
        }
    });

    App.mediator = new Mediator();

    App.mediator.subscribe('ajaxFormLoaded', function(arg){

        //...handle response here
        console.log(arg.response);
    });

    var form = new AjaxFormView();

})(jQuery, _, Backbone);
