/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 18 13:13
*/
/*
combined modules:
editor/plugin/element-path
*/
KISSY.add('editor/plugin/element-path', [
    'editor',
    'node'
], function (S, require, exports, module) {
    /**
 * @ignore
 * ElementPath for debug.
 * @author yiminghe@gmail.com
 */
    var Editor = require('editor');
    var $ = require('node');
    var CLASS = 'editor-element-path';
    function ElementPaths(cfg) {
        var self = this;
        self.cfg = cfg;
        self._cache = [];
        self._init();
    }
    ElementPaths.prototype = {
        _init: function () {
            var self = this, cfg = self.cfg, editor = cfg.editor;
            self.holder = $('<span>');
            self.holder.appendTo(editor.get('statusBarEl'), undefined);
            editor.on('selectionChange', self._selectionChange, self);
            Editor.Utils.sourceDisable(editor, self);
        },
        disable: function () {
            this.holder.css('visibility', 'hidden');
        },
        enable: function () {
            this.holder.css('visibility', '');
        },
        _selectionChange: function (ev) {
            var self = this, cfg = self.cfg, editor = cfg.editor, prefixCls = editor.get('prefixCls'), statusDom = self.holder, elementPath = ev.path, elements = elementPath.elements, element, i, cache = self._cache;
            for (i = 0; i < cache.length; i++) {
                cache[i].remove();
            }
            self._cache = [];    // For each element into the elements path.
            // For each element into the elements path.
            for (i = 0; i < elements.length; i++) {
                element = elements[i];    // 考虑 fake objects
                // 考虑 fake objects
                var type = element.attr('_ke_real_element_type') || element.nodeName(), a = $('<a ' + 'href="javascript(\'' + type + '\')" ' + 'class="' + prefixCls + CLASS + '">' + type + '</a>');
                self._cache.push(a);    /*jshint loopfunc:true*/
                /*jshint loopfunc:true*/
                (function (element) {
                    a.on('click', function (ev2) {
                        ev2.halt();
                        editor.focus();
                        setTimeout(function () {
                            editor.getSelection().selectElement(element);
                        }, 50);
                    });
                }(element));
                statusDom.prepend(a);
            }
        },
        destroy: function () {
            this.holder.remove();
        }
    };
    function ElementPathPlugin() {
    }
    ElementPathPlugin.prototype = {
        pluginRenderUI: function (editor) {
            var elemPath = new ElementPaths({ editor: editor });
            editor.on('destroy', function () {
                elemPath.destroy();
            });
        }
    };
    module.exports = ElementPathPlugin;
});

