define(function(require, exports, module) {
    var defaultOptions = {
        $input: null,
        $panel: null,
        hideWhenEmpty: true,
        // onShow: function(){},
        // onHide: function(){},
        getData: function(val, callback) {},
        renderItem: function(item, index) {},
        selectItem: function(item, index) {}
    }

    var AutoComplete = function(options) {
        var timer = null;
        var This = this;
        this.__item_attribute__ = '__auto_item__';
        this.options = $.extend({}, defaultOptions, options);
        options = this.options;


        options.$input.on('input focus', function() {
            clearTimeout(timer);
            if (options.hideWhenEmpty && !this.value) {
                options.$panel.hide();
                return;
            }
            timer = setTimeout(function() {
                var val = options.$input.val();
                options.getData.call(This, val, function(items) {
                    This.renderItems(items, val);
                });
            }, 200);
        });

        options.$input.on('keydown', function(e) {
            var $children = options.$panel.children('[' + This.__item_attribute__ + ']');
            var $li = $children.filter('.active');
            switch (e.which) {
                case 38: // up
                    if (!$li.length) {
                        $li = $children.last();
                    } else {
                        $li.removeClass('active');
                        $li = $li.prev();
                    }
                    if ($li.length) {
                        $li.addClass('active');
                    }
                    return false;
                case 40: // down
                    if (!$li.length) {
                        $li = $children.first();
                    } else {
                        $li.removeClass('active');
                        $li = $li.next();
                    }
                    if ($li.length) {
                        $li.addClass('active');
                    }
                    return false;
                case 13:
                    $li.length && $li.trigger('click');
                    return false;
            }
        });

        options.$panel.on('click', '[' + this.__item_attribute__ + ']', function() {
                var index = $(this).index();
                options.selectItem.call(This, This.items[index], index);
                options.$panel.hide();
                return false;
            })
            .on('mousemove', 'li', function() {
                options.$panel.children('.active')
                    .removeClass('active');
            });
    }

    AutoComplete.prototype.renderItems = function(items, val) {
        this.items = items;
        var This = this;
        var options = this.options;
        if (val !== options.$input.val()) {
            return;
        }
        if (!items.length) {
            options.$panel.show().html('<li style="text-indent: 1em;color: #afafaf">无数据</li>');
            return;
        }
        var aHtml = [];
        items.forEach(function(item, i) {
            aHtml.push(options.renderItem.call(This, item, i));
        });
        options.$panel.html(aHtml.join('')).show()
            .children()
            .attr(this.__item_attribute__, 1);
        options.onShow && options.onShow(items);
    }

    return AutoComplete;
});

/*
//使用
initialize : function (options) {
            this.options = {}
            $.extend(this.options,options);
            this.$el.html(_.template(this.template,{
                variable : 'data'
            })(this.options));
            this.$el.find('select').beautifySelect('btn-select');
            $(window).trigger('resize');

            // init auto complete
            var $brandsSearch = this.$el.find('[role="brands-search"]');
            var isMatch = function(list, val){
                var match = false;
                list.forEach(function(item){
                    if( item.indexOf(val) >= 0){
                        match = true;
                    }
                });

                return match;
            }
            new AutoComplete({
                $input: $brandsSearch.find('input'),
                $panel: $brandsSearch.find('.dropdown-menu'),
                getData: function(val, callback){
                    var items = [];
                    brands.forEach(function(brand){
                        if( isMatch([brand.name, brand.py, brand.lpy], val) ){
                            items.push({type: 'brand', name: brand.name});
                        }
                        brand.subs.forEach(function(sub_brand){
                            if( isMatch([brand.name+sub_brand.name, brand.py + sub_brand.py, brand.lpy + sub_brand.lpy], val) ){
                                items.push({type: 'sub_brand', name: brand.name + ',' + sub_brand.name});
                            }
                        });
                    });
                    callback(items)
                },
                renderItem: function(item, index){
                    // 如果文字已经变化，则不处理
                    return Util.format('<li role="presentation"><a style="overflow: hidden;text-overflow: ellipsis;" role="menuitem" tabindex="-1" href="#">#[name]</a></li>', item);
                },
                selectItem: function(item){
                    this.options.$input.val(item.name);
                }
            });
}
});*/