(function($, _, Backbone){

    'use strict';

    var App = {};

    var AjaxFormView = Backbone.View.extend({

        el: 'form.ajax',

        currentState: '',

        stateClasses: {
            error: 'state-error',
            loading: 'state-loading',
            success: 'state-success'
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

            if(state === 'loading'){
                $('input, select, textarea', this.$el).attr('disabled', 'disabled');
            }else{
                $('input, select, textarea', this.$el).removeAttr('disabled');
            }
        },

        result: function(result, response){
            this.setState(result);

            // Publish event
            App.mediator.publish('ajaxFormLoaded', {
                result: result,
                response: response,
                $el: this.$el
            });
        },

        submit: function(e){

            var self = this;

            var formData = this.$el.serialize(),
                processData = true, // jQuery default
                contentType = 'application/x-www-form-urlencoded; charset=UTF-8'; // jQuery default

            // Use FormData if supported, allows sending file input data
            if(typeof window.FormData === 'function'){
                var formData = new FormData(this.el),
                    processData = false,
                    contentType = false;
            }

            $.ajax({
                type: 'POST',
                url: this.url,
                processData: processData,
                contentType: contentType,
                cache: false,
                data: formData,
                error: function(response){
                    self.result('error', response);
                },
                success: function(response){
                    self.result('success', response);
                }
            });

            this.setState('loading');

            e.preventDefault();
        }
    });

    App.mediator = new Mediator();

    App.mediator.subscribe('ajaxFormLoaded', function(arg){

        //...handle response here
        console.log(arg.response);
    });

    var form = new AjaxFormView();

})(jQuery, _, Backbone);
