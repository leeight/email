/**
 * ER-Track
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 加载一个js文件
 * @author otakustay
 */
define(
    function (require) {
        return function (url, callback) {
            var script = document.createElement('script');
            script.charset = 'utf-8';
            script.async = true;
            script.src = url;

            if (callback) {
                var complete = false;
                script.onload = script.onreadystatechange = function () {
                    if (!complete &&
                        (!this.readyState
                            || this.readyState === 'loaded'
                            || this.readyState === 'complete'
                        )
                    ) {
                        complete = true;
                        callback();
                    }
                };
            }

            var holder = document.getElementsByTagName('script')[0];
            if (holder && holder.parentNode) {
                holder.parentNode.insertBefore(script, holder);
            }
            else {
                var container =
                    document.getElementsByTagName('head')[0] || document.body;
                container.insertBefore(script, container.firstChild);
            }
        };
    }
);
