const gulp = require('gulp');
const merge = require('gulp-merge-json');
const file = require('gulp-file');
const fs = require('fs');
const moment = require('moment');
const cleanCSS = require('gulp-clean-css');

gulp.task('merge-talks', function() {
    // Merge all our talks into a global data format for 11ty
    return gulp.src('data/talks/**/*.json')
        .pipe(merge({
            concatArrays: true,
            startObj: [],
            fileName: 'data.json'
        }))
        .pipe(gulp.dest('./src/_data'));
});

gulp.task('merge-conferences', function() {
    // Merge all our talks into a global data format for 11ty
    return gulp.src('data/conferences/**/*.json')
        .pipe(merge({
            concatArrays: true,
            startObj: {},
            fileName: 'conferencedetails.json'
        }))
        .pipe(gulp.dest('./src/_data'));
});

gulp.task('merge-contributors', function() {
    // Merge all our talks into a global data format for 11ty
    return gulp.src('data/contributors/**/*.json')
        .pipe(merge({
            concatArrays: true,
            startObj: {},
            fileName: 'contributors.json'
        }))
        .pipe(gulp.dest('./src/_data'));
});

gulp.task('merge-speakers', function() {
    // Merge all our talks into a global data format for 11ty
    return gulp.src('data/speakers/**/*.json')
        .pipe(merge({
            concatArrays: true,
            startObj: {},
            fileName: 'speakerdetails.json'
        }))
        .pipe(gulp.dest('./src/_data'));
});


gulp.task('find-conferences', function(){
    // Get our merged data
    const json = JSON.parse(fs.readFileSync('./src/_data/data.json'));

    // Package up an array of conferences
    let conferences = [];
    json.forEach(function(e){
        pushUniqueArray(conferences,e.conference)
    });

    conferences.sort();

    return file('conferences.json', JSON.stringify(conferences), { src: true })
        .pipe(gulp.dest('src/_data'));
});


gulp.task('find-years', function(){
    // Get our merged data
    const json = JSON.parse(fs.readFileSync('./src/_data/data.json'));

    // Package up an array of years
    let years = [];
    json.forEach(function(e){
        const f = moment(e.date, 'YYYY-MM-DD');
        pushUniqueArray(years,f.format('YYYY'))
    });

    years.sort();

    return file('years.json', JSON.stringify(years), { src: true })
        .pipe(gulp.dest('src/_data'));
});
function sort_by_key(array, key)
{
    return array.sort(function(a, b)
    {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

gulp.task('order-talks', function(){
    // Get our merged data
    const json = JSON.parse(fs.readFileSync('./src/_data/data.json'));

    // Package up an array of years
    json.forEach(function(e){
        e.talks = sort_by_key(e.talks, 'title');
    });

    return file('data.json', JSON.stringify(json), { src: true })
        .pipe(gulp.dest('src/_data'));
});


gulp.task('find-speakers', function(){
    // Get our merged data
    const json = JSON.parse(fs.readFileSync('./src/_data/data.json'));

    // Package up an array of speakers
    let speakers = [];
    json.forEach(function(e){
        e.talks.forEach(function(f){
            pushUniqueArray(speakers,f.speaker)
        });
    });

    speakers.sort();

    return file('speakers.json', JSON.stringify(speakers), { src: true })
        .pipe(gulp.dest('src/_data'));
});

gulp.task('minify-css', () => {
    return gulp.src('src/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

function pushUniqueArray(array,item){
    if(array.indexOf(item) === -1) {
        array.push(item);
    }
}

gulp.task('default',gulp.series('minify-css','merge-talks','order-talks','find-conferences','find-years','find-speakers', 'merge-contributors', 'merge-conferences','merge-speakers'),function(){});
