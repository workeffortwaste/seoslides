const htmlmin = require("html-minifier");
var slugify = require('slugify');
var moment = require('moment');
const gitlog = require('gitlog');

module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy('src/img');
    eleventyConfig.addPassthroughCopy('src/js');
    eleventyConfig.addPassthroughCopy('src/meta');
    eleventyConfig.addPassthroughCopy('src/_headers');

    eleventyConfig.addCollection("changelog", function() {
        // Set up gitlog options.
        const options =
            { repo: __dirname,
                number: 50,
                fields:
                    [ 'hash',
                        'abbrevHash',
                        'subject',
                        'authorName',
                        'authorDate',
                        'subject',
                    ]
            };
        // Get commits
        let commits = gitlog(options);
        // Filter only the commits we've flagged for posting
        let output = commits.filter (e => e.subject.includes('[p]'));
        // Convert the date format simply into YYYY-MM-DD
        output.forEach((e) => {
            const t = moment(e.authorDate,'YYYY-MM-DD HH:mm:ss ZZ');
            e.authorDate = t.format('YYYY-MM-DD');
        });
        // Return our sanitised data
        return commits.filter (e => e.subject.includes('[p]'));
    });

    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
            });
            return minified;
        }

        return content;
    });

    eleventyConfig.addShortcode("output_talk", function (e,conference,date) {
        return `
            <li>
                <div class="talk">${e.title}</div>
                <div class="conference">${returnLink('/conferences/' + conference + '/' + date + '/', conference, false, false, true)}</div>
                <div class="slides">${returnLink(e.slides, 'Slides', true)}</div>
                <div class="recap">${returnLink(e.recap, 'Recap', false)}</div>
                <div class="video">${returnLink(e.video, 'Video', true)}</div>
                <div class="audio">${returnLink(e.audio, 'Audio', true)}</div>
            </li>
            `;
    });

    eleventyConfig.addShortcode("long_date", function (e) {
        const t = moment(e, 'YYYY-MM-DD');
        return t.format('MMMM Do YYYY');
    });

    eleventyConfig.addShortcode("year_date", function (e) {
        const t = moment(e, 'YYYY-MM-DD');
        return t.format('YYYY');
    });

    eleventyConfig.addShortcode("output_talks", function (talks) {
        let data = `<ul>`;
        talks.forEach(function (e) {
            data += `
            <li>
                <div class="talk">${e.title}</div>
                <div class="speaker">${returnLink('/speakers/' + e.speaker + '/', e.speaker, false, false, true)}</div>
                <div class="slides">${returnLink(e.slides, 'Slides', true, true)}</div>
                <div class="recap">${returnLink(e.recap, 'Recap', true, true)}</div>
                <div class="video">${returnLink(e.video, 'Video', true, true)}</div>
                <div class="audio">${returnLink(e.audio, 'Audio', true, true)}</div>
            </li>
            `
        });
        data += `</ul>`;
        return data
    });

    eleventyConfig.addShortcode("count_talks", function (data) {
        let count = 0;
        data.forEach(function(e){
            count += e.talks.length
        });
        return count;
    });

    function returnLink(url, text, nofollow, newwindow, slug) {
        if (!url) {
            return ''
        }
        let follow_tag = '';
        if (nofollow) {
            follow_tag = `rel=nofollow`
        }
        if (slug) {
            url = slugify(url, {lower: true, remove: /[*+~()"!:@]/g})
        }
        let target = "_self";
        if (newwindow){
            target = "_blank";
        }
        return `<a target="${target}" ${follow_tag} href="${url}">${text}</a>`
    }

    return {
        dir: {
            input: 'src',
            output: 'dist'
        },
        passthroughFileCopy: true
    };
};
