define(function(require, exports, module) {
    var g = require("global");
    var pedestrianAttributeFormater = {
        male: function(attr) {
            var vals = {
                '0': '未知',
                '1': '男',
                '-1': '女'
            }

            return {
                type: 'gender',
                label: '性别',
                value: vals[attr.category]
            }
        },
        hat: function(attr) {
            if (attr.category == 1) {
                return {
                    type: 'hat',
                    label: '戴帽子',
                    value: ''
                }
            }
        },
        long_hair: function(attr) {
            if (attr.confidence > 0.3) {
                return {
                    type: 'hair',
                    label: attr.category == 1 ? '长发' : '短发',
                    value: ''
                }
            }
        },
        sunglasses: function(attr) {
            if (attr.category == 1) {
                return {
                    type: 'sunglasses',
                    label: '戴墨镜',
                    value: ''
                }
            }
        },
        face_mask: function(attr) {
            if (attr.category == 1) {
                return {
                    type: 'face_mask',
                    label: '戴面罩',
                    value: ''
                }
            }
        },
        dress_upper: function(attr, attrDict) {
            var vals = {
                long_sleeves: {
                    '1': '长袖',
                    '-1': '短袖',
                },
                stripe: {
                    '1': '条纹'
                },
                tshirt: {
                    '1': 'T恤'
                },
                formal: {
                    '1': '正装'
                },
                logo: {
                    '1': '带LOGO'
                }
            }


            var val = [];
            for (var k in vals) {
                if (attrDict[k]) {
                    vals[k][attrDict[k].category] && val.push(vals[k][attrDict[k].category])
                }
            }
            var color = attrDict.dress_upper_color;
            var value = '<i style="color: ' + ['rgb(' + color.r, color.g, color.b + ')'].join(',') + '" class="fa fa-square"></i> ' + val.join(',');
            return {
                type: 'dress_upper',
                label: '上身',
                value: value
            }
            // return val.length ? {type: 'dress_upper', label: '上身', value: val.join(','), color: ['rgb('+ color.r , color.g , color.b+')'].join(',')} : null;
        },
        dress_lower: function(attr, attrDict) {
            var vals = {
                jeans: {
                    '1': '牛仔裤'
                },
                long_pants: {
                    '1': '长裤',
                    '-1': '短裤'
                },
                shorts: {
                    '1': '短裤'
                },
                skirt: {
                    '1': '裙子'
                }
            }

            var val = [];
            for (var k in vals) {
                if (attrDict[k]) {
                    var v = vals[k][attrDict[k].category];
                    v && val.indexOf(v) < 0 && val.push(v);
                }
            }
            var color = attrDict.dress_lower_color;
            var value = '<i style="color: ' + ['rgb(' + color.r, color.g, color.b + ')'].join(',') + '" class="fa fa-square"></i> ' + val.join(',');
            return {
                type: 'dress_lower',
                label: '下身',
                value: value
            }
            // return val.length ? {type: 'dress_lower', label: '下身', value: val.join(','), color: ['rgb('+ color.r , color.g , color.b+')'].join(',')} : null;
        },
        bags: function(attr, attrDict) {
            if (attr && attr.length) {
                var value = [];
                attr.forEach(function(color) {
                    value.push('<i style="color: ' + ['rgb(' + color.r, color.g, color.b + ')'].join(',') + '" class="fa fa-square"></i>')
                });

                return {
                    type: 'bags',
                    label: '背包',
                    value: value.join(' ')
                }
            }
        }
    }

    var vehicleAttributeFormater = {
        category: function(attr) {
            return {
                type: 'category',
                label: '类别',
                value: attr
            }
        },
        classification: function(attr, attrDict) {
            if (attr) {
                return {
                    type: 'classification',
                    label: '车型',
                    value: attr.name
                }
            }
        },
        colors: function(attr, attrDict) {
            if (attr) {
                return {
                    type: 'colors',
                    label: '颜色',
                    value: attr.name
                }
            }
        }
    }

    var attributeFormaterFn = function(formater, attribute, items) {
        var attrs = [];
        items.forEach(function(key) {
            var attr = attribute[key];
            if (formater[key]) {
                var _attr = formater[key](attr, attribute);
                _attr && attrs.push(_attr);
            }
        });

        return attrs;
    }
    var attributeFormater = {
        pedestrian: function(attribute) {
            return attributeFormaterFn(pedestrianAttributeFormater, attribute, 'male,dress_upper,dress_lower,bags,hat,long_hair,sunglasses,face_mask'.split(','));
        },
        vehicle: function(attribute) {
            return attributeFormaterFn(vehicleAttributeFormater, attribute, 'category,classification,colors'.split(','));
        }
    }

    // Note: 之所使用canvas是因为canvas中的Rect相比dom更具有稳定性，不会抖
    var TrackPlayer = function($video, $canvas) {
        this.$attrWrap = $('<div class="track-attribute-wrap"></div>').insertAfter($canvas);
        this.$video = $video;
        this.$canvas = $canvas;
        var This = this;
        var timer = null;
        //console.log($video);
        $video.on('pause', function() {
                This.stop(false);
            })
            .on('play', function() {
                This.play.apply(This, This.playArgs);
            })
            .on('seeked', function() {
                if (this.paused) {
                    This.play.apply(This, This.playArgs);
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        This.stop(false);
                    }, 50);
                }
            });

        this.ctx = this.$canvas[0].getContext('2d');
        this.scale = 0; // 视频的缩放比例
        this.time = 0; // 视频的播放时间
        this.animateId = 0;

        this.showTrack = true;
    }

    TrackPlayer.prototype = {
        reset: function() {
            this.ctx.clearRect(0, 0, this.$canvas[0].width, this.$canvas[0].height - 5);
            this.$attrWrap.children().remove();
        },
        stop: function(reset) {
            reset && this.reset();
            cancelAnimationFrame(this.animateId);
        },
        toggleTrack: function(showTrack) {
            this.showTrack = showTrack;
            if (!this.showTrack) {
                this.reset();
            }
        },
        drawHtmlAttribute: function(track, attribute, rect) {
            /*
            track.$attribute = track.$attribute || $('<div class="track-attr"></div>').appendTo(this.$attrWrap).css({
                                position: 'absolute',
                                borderColor: track.color,
                }).attr('id', track.tid);
            track.$attribute.css({
                display: 'block'
            });

            var minWidth = track.$attribute.width();
            var left = rect.left,
                top = rect.top;
            var cWidth = this.$canvas[0].width;

            var hasLeftSpace = rect.left - minWidth > 0;
            var hasRightSpace = rect.left + rect.width + 2 + minWidth < cWidth;
            if ((!hasLeftSpace && !hasRightSpace) || hasRightSpace) {
                left = rect.left + rect.width + 2;
            } else {
                left = rect.left - minWidth;
            }
            track.$attribute.css({
                top: top,
                left: left,
                display: 'block'
            });

            // build html
            var htmls = [];
            var attrs = attributeFormater[track.type](attribute);
            $.each(attrs, function(i, attr) {
                htmls.push(g.format('<p>#[text]</p>', {
                    text: attr.value ? g.format('<b>#[label]</b>：#[value]', attr) : attr.label,
                }));
            });
            track.$attribute.html(htmls.join(''))*/
        },
        __getTrackDuration: function(track) {
            var firstFrame = track.frames[0];
            var lastFrame = track.frames[track.frames.length - 1];
            return [firstFrame.offset, lastFrame.offset]
        },
        drawTrack: function(track) {
            var _this = this;
            var ctx = this.ctx;
            var time = this.time;
            var attribute = {};
            var currentFrame = null;
            var index = 0;
            var duration = this.__getTrackDuration(track);
            if (duration[0] > time || time > duration[1]) {
                if (track.$attribute) {
                    track.$attribute.remove();
                    delete track.$attribute;
                }
                return;
            }

            $.each(track.frames || [], function(i, frame) {
                if (frame.offset < time) {
                    attribute = $.extend(attribute, frame.attribute);
                    currentFrame = frame;
                    index = i;
                } else {
                    return false;
                }
            });

            nextFrame = track.frames[index + 1];
            if (currentFrame) {
                // 中心点动，宽度与高度固定方案
                var currBound = getFrameBoundingBoxAverage(track, index);

                var left = currBound.left,
                    top = currBound.top,
                    width = currBound.width,
                    height = currBound.height;

                if (nextFrame) {
                    var r = (time - currentFrame.offset) / (nextFrame.offset - currentFrame.offset);
                    var nextBound = getFrameBoundingBoxAverage(track, index + 1);
                    left += r * (nextBound.left - left);
                    top += r * (nextBound.top - top);
                    width += r * (nextBound.width - width);
                    height += r * (nextBound.height - height);
                }

                // draw track
                track.color = track.color || (function() {
                    return ['rgb(' + ~~(Math.random() * 255), ~~(Math.random() * 255), ~~(Math.random() * 255) + ')'].join(',');
                })();

                ctx.strokeStyle = track.color;
                ctx.lineWidth = 2;
                var rect = {
                    left: left * this.scale,
                    top: top * this.scale,
                    width: width * this.scale,
                    height: height * this.scale
                }

                ctx.strokeRect(
                    rect.left,
                    rect.top,
                    rect.width,
                    rect.height
                );

                // draw attribute
                this.drawHtmlAttribute(track, attribute, rect);
            }
        },
        play: function(url, trackCreate) {
            var This = this;
            var ctx = this.ctx;
            var canvas = this.$canvas[0];
            this.playArgs = arguments;
            // hide all attributes
            var draw = function() {
                var tracks = typeof trackCreate == 'function' ? trackCreate() : trackCreate;
                var isArray = Object.prototype.toString.call(tracks) === '[object Array]'

                This.time = This.$video[0].currentTime;
                // 单个track播放的时候
                if (!isArray) {
                    tracks = [tracks];
                    var duration = This.__getTrackDuration(tracks[0]);
                    if (This.time >= duration[1]) {
                        This.$video[0].pause();
                        trackCreate = [];
                        return;
                    }
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // hide all attributes
                This.$attrWrap.children().hide();
                $.each(tracks, function(i, track) {
                    This.drawTrack(track);
                });
            }
            this.stop();
            (function frame() {
                This.animateId = requestAnimationFrame(frame);
                if (This.showTrack) {
                    draw();
                }
            })();
        }
    }

    function getFrameBoundingBoxAverage(track, index) {
        var frames = track.frames;
        var len = Math.min(Math.min(index, 7), frames.length - 1 - index);
        var tmpFrames = frames.slice(index - len, index + len + 1);
        var trackHeight = 0,
            trackWidth = 0,
            centerX = 0,
            centerY = 0;
        $.each(tmpFrames || [], function(i, frame) {
            trackHeight += frame.bound[3];
            trackWidth += frame.bound[2];
            centerX += frame.bound[0] + frame.bound[2] / 2;
            centerY += frame.bound[1] + frame.bound[3] / 2;
        });
        trackHeight /= tmpFrames.length;
        trackWidth /= tmpFrames.length;
        centerX /= tmpFrames.length;
        centerY /= tmpFrames.length;

        if (track.type == 'pedestrian') {
            trackHeight *= 1.05;
            trackWidth *= 1.5;
        }
        return {
            top: centerY - trackHeight / 2,
            left: centerX - trackWidth / 2,
            width: trackWidth,
            height: trackHeight
        }
    }


    var colorMgr = {
        rgbToHex: function(r, g, b) {
            return (r < 16 ? "0" + r.toString(16).toUpperCase() : r.toString(16).toUpperCase()) + (g < 16 ? "0" + g.toString(16).toUpperCase() : g.toString(16).toUpperCase()) + (b < 16 ? "0" + b.toString(16).toUpperCase() : b.toString(16).toUpperCase());
        },
        hexToRgb: function(h) {
            var r = 0,
                g = 0,
                b = 0;
            r = parseInt(h[0], 16) * 16 + parseInt(h[1], 16);
            g = parseInt(h[2], 16) * 16 + parseInt(h[3], 16);
            b = parseInt(h[4], 16) * 16 + parseInt(h[5], 16);
            return [r, g, b];
        },
        rgbToReverse: function(r, g, b) {
            // 如果是灰色系，则取白色或者黑色背景
            // 判断颜色是偏白还是偏黑
            if (r + g + b < 255 * 3 / 2) {
                return [255, 255, 255]
            } else {
                return [0, 0, 0]
            }

            var hex = this.rgbToHex(r, g, b);
            var reverse = this.hexToReverse(hex);
            return this.hexToRgb(reverse);
        },
        hexToReverse: function(h) {
            var r = 0,
                g = 0,
                b = 0;
            r = 255 - parseInt(h[0], 16) * 16 - parseInt(h[1], 16);
            g = 255 - parseInt(h[2], 16) * 16 - parseInt(h[3], 16);
            b = 255 - parseInt(h[4], 16) * 16 - parseInt(h[5], 16);
            return (r < 16 ? "0" + r.toString(16).toUpperCase() : r.toString(16).toUpperCase()) + (g < 16 ? "0" + g.toString(16).toUpperCase() : g.toString(16).toUpperCase()) + (b < 16 ? "0" + b.toString(16).toUpperCase() : b.toString(16).toUpperCase());
        }
    }

    return TrackPlayer;
});