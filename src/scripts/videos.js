define(function(require, exports, module) {
    var $ = require("jquery");
    var Backbone =require('backbone');
    var TrackPlayer = require("src/scripts/trackPlayer"),
        Util = require("global");
    var setting = {};
    var settingTool = null;
    var settingTools = {};
    var track = window.data;
    var VideoView = Backbone.View.extend({
        el: $('.video-panel'),
        initialize: function() {
            // default video setting
            this.storageKey = 'reid-player-setting';
            this.setting = {
                show_track: 1
            };
            var $video = this.$video = this.$el.find('video');
            var $canvas = this.$canvas = this.$el.find('canvas');

            this.trackPlayer = new TrackPlayer($video, $canvas);
            this.applySetting(this.videoSetting());

            var This = this;
            $video.on('loadedmetadata', function() {
                This.resize()
            });

            var timer = null;
            $(window).on('resize', function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    This.resize();
                }, 50);
            });

            // reset when play
            // $video.on('playing', function() {
            //     This.trackPlayer.reset();
            // });

            // get track where video time update
            This.trackCache = {};
            // 获取当前这一分钟的track
            // 如果离下一分钟还有10秒的时候，获取下一分钟的track


            var getTrack = function(url, time) {
                var trackType = This.getTrackType();
                var key = This.getTrackCacheKey(url, time);
                if (This.trackCache[key] === undefined) {
                    This.trackCache[key] = [];
                    /*$.get('/video/' + This.video.id + '/track/' + trackType + '?time=' + time, function(resp) {
                        This.trackCache[key] = resp.data.length ? resp.data : undefined;
                    });*/
                    $.get('/json/track.json', function(resp) {
                        console.log(resp);
                        This.trackCache[key] = resp.frames.length ? resp.frames : undefined;
                    });
                }
            }


            /*getTrack("/json/track.json",0);
            return;*/
            $video.on('timeupdate', function() {
                if (!This.loadVideoTrack) {
                    return;
                }
                var time = ~~(this.currentTime / 60) * 60;
                getTrack(this.src, time);
                // 获取下一分钟的内容
                if (this.currentTime % 60 > 50) {
                    getTrack(this.src, time + 60);
                }
            });
        },
        getTrackType: function() {
            var types = {
                'struct': 'pedestrian',
                'reid': 'pedestrian',
                'struct-vehicle': 'vehicle',
                'reid-vehicle': 'vehicle'
            }

            return types["struct"];
        },
        getTrackCacheKey: function(url, time) {
            return [url, time, this.getTrackType()].join('-');
        },
        resize: function() {
            // TODO....后期把canvas剥离
            // resize video element
            var $videoPanel = this.$el;
            $videoPanel.css('top', $videoPanel.prev().height());
            $videoPanel.find('video[role="preview-video"]')
                .removeClass('hide')
                .attr('height', $videoPanel.outerHeight() - $videoPanel.find('.panel-heading').outerHeight() - 1);

            // resize canvas
            var $video = this.$video;
            var $canvas = this.$canvas;

            var video = $video[0];
            var lastVideoWdith, lastVideoHeight, lastElWidth, lastElHeight;
            var vw = $video.width();
            var vh = $video.height();
            if (lastVideoWdith == video.videoWidth && lastVideoHeight == video.videoHeight && lastElWidth == vw && lastElHeight == vh) {
                return;
            }
            lastElWidth = vw;
            lastElHeight = vh;
            lastVideoWdith = video.videoWidth;
            lastVideoHeight = video.videoHeight;
            var rate = video.videoWidth / video.videoHeight;
            var width = vw;
            var height = vh;
            var canvasWidth, canvasHeight;
            if (width / height > rate) {
                canvasWidth = height * rate;
                canvasHeight = height;
            } else {
                canvasWidth = width;
                canvasHeight = width / rate;
            }

            var canvasLeft = (width - canvasWidth) / 2;
            var canvasTop = (height - canvasHeight) / 2;
            $canvas.attr({
                width: canvasWidth,
                height: canvasHeight,
            });
            $video.siblings().css({
                width: canvasWidth,
                height: canvasHeight,
                left: canvasLeft,
                top: canvasTop
            });
            // TODO.. tool-container 不能遮住播放条
            $video.siblings('.tool-container').css('height', canvasHeight - 30);

            this.scale = this.trackPlayer.scale = canvasWidth / video.videoWidth;

            this.trigger('resize');
        },
        videoSetting: function(value) {
            var setting = Util.getStorage(this.storageKey);
            setting = setting ? JSON.parse(setting) : {};
            setting = $.extend({}, this.setting, setting);

            // save content
            if (value) {
                setting = $.extend(setting, value || {});
            }
            Util.setStorage(this.storageKey, JSON.stringify(setting));
            return setting;
        },
        applySetting: function(setting) {
            this.trackPlayer.toggleTrack(setting.show_track);
        },
        playTrack: function(video, track, time) {
            var $video = this.$video = this.$el.find('video');
            var $canvas = this.$canvas = this.$el.find('canvas');
            this.playVideo(video, time);
            this.trackPlayer.play(video.path, track);
        },
        playVideo: function(video, time, loadVideoTrack) {
            this.$el.find('#video-name').html(video.name);
            // enable tools
            this.$el.find('button[role="tools"]').removeAttr('disabled');

            this.video = video;
            this.loadVideoTrack = loadVideoTrack;
            var videoEl = this.$video[0];
            if (videoEl.src != video.path) {
                videoEl.src = video.path;
                videoEl.load();
            }
            videoEl.currentTime = time || 0;
            videoEl.play();
            if (loadVideoTrack) {
                var This = this;
                this.trackPlayer.play(video.path, function() {
                    return This.__getCurrentTracks(video)
                });
            }
        },
        __getCurrentTracks: function(video) {
            var time = ~~(this.$video[0].currentTime / 60) * 60;
            var key = this.getTrackCacheKey(video.path, time);

            // 需要跟前一个节点的数据进行合并，这样就不会出现断层的现象
            var prevKey = this.getTrackCacheKey(video.path, time - 60);
            var prevTracks = this.trackCache[prevKey] || [];
            return prevTracks.concat(this.trackCache[key] || []);
        },
        stop: function() {
            this.$video[0].pause();
        }
    });
    var videoView = new VideoView();
    videoView.resize();
    return videoView;
});