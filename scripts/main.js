
var AjaxFormView = function(options){

    'use strict';

    var _handleSubmit = function (e) {

        var $form = $(e.currentTarget),
            options = {
                type: 'POST',
                url: module.settings.url,
                data: $form.serialize(),
                error: _handleResult,
                success: _handleResult,
                xhr: function () {

                    var xhr = new window.XMLHttpRequest();

                    // Upload progress
                    xhr.upload.addEventListener('progress', function (evt) {

                        var percentComplete = Math.round((evt.loaded / evt.total) * 100);
                        $('progress', $form).html(percentComplete + '%');
                        $('progress', $form).val(percentComplete);

                    }, false);

                    return xhr;
                }
            };

        // Use FormData if supported, allows sending file input data
        if (typeof window.FormData === 'function' || typeof window.FormData === 'object') {
            options.data = new FormData($form[0]);
            options.processData = false;
            options.contentType = false;
        }

        $.ajax(options);

        module.setState('loading', $form);
    };

    var _handleResult = function (response, result) {
        module.setState(result);
        if(typeof module.settings.callback === 'function'){
            module.settings.callback(response, result);
        }
    };

    var module = {

        settings: {
            currentState: '',
            stateClasses: {
                success: '__success',
                error: '__error',
                loading: '__loading'
            }
        },

        clearForm: function(){
            $('input:not([type="submit"])', this.settings.$el).val('');
            $('textarea', this.settings.$el).val('');
            $('select', this.settings.$el).val('');
        },

        setState: function (state) {

            var $el = this.settings.$el;

            // Update state class on form
            $el.removeClass(this.settings.stateClasses[this.settings.currentState]);
            $el.addClass(this.settings.stateClasses[state]);
            this.settings.currentState = state;

            // Prevent user from editing form while loading
            if (state === 'loading') {
                $('input, select, textarea', $el).attr('disabled', 'disabled');
            } else {
                $('input, select, textarea', $el).removeAttr('disabled');
            }

            return $el;
        },

        events: function () {
            this.settings.$el.submit(function (e) {
                // Prevent form from submitting normally
                e.preventDefault();
                _handleSubmit(e);
            });
        },

        init: function (options) {

            if (!options.$el) {
                console.error('AjaxFormView requires a jQuery object.');
                return false;
            }

            this.settings.url = options.$el.attr('action');

            // merge options and default settings
            $.extend(true, this.settings, options);

            // bind events
            this.events();

            return this;
        }
    };

    return module.init(options);
};

$(function(){

    var ajaxForm = new AjaxFormView({
        $el: $('form#form-1'),
        stateClasses: {

            // custom loading class
            loading: '__loading disabled'
        },

        // callback after AJAX
        callback: function(response, result) {
            console.log('response', response);
            console.log('result', result);
        }
    });

    var otherAjaxForm = new AjaxFormView({
        $el: $('form#form-2'),

        // callback after AJAX
        callback: function(response, result) {
            console.log('response', response);
            console.log('result', result);

            otherAjaxForm.clearForm();
        }
    });

});