$.ajax({
    url: '/progressViewer',
    dataType: 'json',
    success : function(data){
        process_data(data);
    }
});

function process_data(data){

    var projects_db,
        project_tasks = [],
        i = 0;

    //Gets JSON data
    projects_db = data.projects

    //Creates project templates
    for(i; i<projects_db.length; i++){
        $('.projects_container').append($('.project_template').html());
    }

    //Puts project tasks into array
    $(projects_db).each(function(){
        project_tasks.push(this.projectDetails);
    });

    //applies each project image
    $('.projects_container').find('.project_avatar').each(function(index){
        $(this).attr('src', projects_db[index].projectAvatar);
    });

    function createClosedView(){
        for(i = 0; i<project_tasks.length; i++){
            $.each(project_tasks[i], function(){
                var percentage_used,
                    rounded_percent,
                    now = moment(),
                    avatar = this.userAvatar,
                    task_name = this.taskName,

                //Converts original estimates into minutes. Adjusted to days = 7.5 hours and weeks = 5 days
                    orig_taskWeeks = this.origEstimate_weeks * 2250,
                    orig_taskDays = this.origEstimate_days * 450,
                    orig_taskHours = this.origEstimate_hours * 60,
                    orig_taskMinutes = this.origEstimate_minutes,
                    task_progress = moment(this.task_in_progress);

                //Minutes elapsed since task was in progress
                this.elapsed_total = Math.round(now.diff(task_progress, 'minutes', true)); 

                //Converts totat elapsed time into weeks, days, minutes and hours
                var t1 = this.elapsed_total,
                    t2 = Math.floor(t1/10080),
                    t3 = t1-(t2*10080),
                    t4 = Math.floor(t3/1440),
                    t5 = t3-(t4*1440),
                    t6= Math.floor(t5/60),
                    t7= t5-(t6*60);

                this.elapsed_weeks = t2;
                this.elapsed_days = t4;
                this.elapsed_hours = t6;
                this.elapsed_minutes = t7;


                //Adjustments for elapsed time
                if(this.elapsed_days > 5){
                    this.elapsed_days = this.elapsed_days - 5;
                    this.elapsed_weeks = this.elapsed_weeks + 1;
                }

                if(this.elapsed_hours > 15){
                    this.elapsed_days = this.elapsed_days + 2;
                    this.elapsed_hours = this.elapsed_hours - 15;
                }

                if(this.elapsed_hours > 7 && this.elapsed_hours < 15){
                    this.elapsed_days = this.elapsed_days + 1;
                    this.elapsed_hours = this.elapsed_hours - 8;
                    this.elapsed_minutes = this.elapsed_minutes + 30;

                    if(this.elapsed_minutes > 59){
                        this.elapsed_minutes = this.elapsed_minutes -60;
                        this.elapsed_hours = this.elapsed_hours + 1;
                    }
                }

                //Converts total time to into minutes. Days = 7.5 Hours and Weeks = 5 Days
                var elapsed_weeks = this.elapsed_weeks * 2250,
                    elapsed_days = this.elapsed_days * 450,
                    elapsed_hours = this.elapsed_hours * 60,
                    elapsed_minutes = this.elapsed_minutes;

                this.calculated_elapsed_total = elapsed_weeks + elapsed_days + elapsed_hours + elapsed_minutes;         //Total number of minutes passed
                this.orig_total = orig_taskWeeks + orig_taskDays + orig_taskHours + orig_taskMinutes;                   //Total number of minutes allocated
                percentage_used = (((Math.round((this.calculated_elapsed_total / this.orig_total)*100)/100)) * 100);    //Percentage of time used
                this.rounded_percent = Math.round(percentage_used);                                                     //Percentage of time rounded
                rounded_percent = this.rounded_percent;

                this.remaining_weeks = this.origEstimate_weeks - this.elapsed_weeks;
                this.remaining_days = this.origEstimate_days - this.elapsed_days;
                this.remaining_hours = this.origEstimate_hours - this.elapsed_hours;
                this.remaining_minutes = this.origEstimate_minutes - this.elapsed_minutes;

                if(rounded_percent <= 90){
                    $('.proj_green').append(function(){
                        $(this).tooltip();
                        $(this).append('<img class="quick_view" src=' + avatar + ' title="' + task_name + ' ' + rounded_percent + '%">');
                    });
                }

                if(rounded_percent >= 91 && rounded_percent <= 110 ){
                    $('.proj_yellow').append(function(){
                        $(this).tooltip();
                        $(this).append('<img class="quick_view" src=' + avatar + ' title="' + task_name + ' ' + rounded_percent + '%">');
                    });
                }

                if(rounded_percent >= 111){
                    $('.proj_red').append(function(){
                        $(this).tooltip();
                        $(this).append('<img class="quick_view" src=' + avatar + ' title="' + task_name + ' ' + rounded_percent + '%">');
                    });
                }
            });
        }
    }

    function createOpenView(){
        $('.projects_container').find('.project_title').each(function(index){
            var projects_div = $(this).closest('.projects'),
                project_closed_div = $(projects_div).children('.proj_closed'),
                project_open_div = $(projects_div).children('.proj_open'),
                project_toggle = $(projects_div).find('.project_toggle'),
                user_template = $('.user_template').html(),
                viewer_template = $('.viewer_template').html();

            //opens and closes viewers
            $(project_toggle).click(function(){
                var projectsArray = $(this).parent();
                var openClose = projectsArray.siblings();
                $(openClose).toggleClass('hidden');

                if($(this).hasClass('open')){
                    $(this).removeClass('open');
                    return false;
                } else {
                    $(this).addClass('open');
                    return false;
                }
            });

            //Sets project titles
            $(this).text(projects_db[index].projectName);

            $(project_tasks[index]).each(function(){
                var avatar = this.userAvatar,
                    rounded_percent = this.rounded_percent,
                    user = this.username,
                    taskName = this.taskName,

                    orig_week = this.origEstimate_weeks,
                    orig_day = this.origEstimate_days,
                    orig_hour = this.origEstimate_hours,
                    orig_minute = this.origEstimate_minutes,
                    elapsed_weeks = this.elapsed_weeks,
                    elapsed_days = this.elapsed_days,
                    elapsed_hours = this.elapsed_hours,
                    elapsed_minutes = this.elapsed_minutes,
                    remaining_weeks = this.remaining_weeks,
                    remaining_days = this.remaining_days,
                    remaining_hours = this.remaining_hours,
                    remaining_minutes = this.remaining_minutes;

                $(viewer_template).appendTo($(project_open_div)).append(function(){
                    $(this).append('<img src='+ avatar +'><span class="user_name">' + user + '</span>');
                    $('<div class="task_details"></div>').appendTo($(this)).append(function(){

                        $(this).append('<div class="task_title">' + taskName + '</div>');
                        $(this).append('<p class="task_percent">' + rounded_percent + '</p>');
                        $('<div class="buffer_div"></div>').appendTo($(this)).append(function(){
                            $(this).append(function(){

                                $(this).append('<div class="pin" title="Original Estimate<br/>' + orig_week + 'w ' + orig_day + 'd ' + orig_hour + 'h ' + orig_minute + 'm "></div>');

                                var pin = $(this).children('.pin');
                                var pin_buffer = {};
                                var bar_buffer = {};

                                $(pin).tooltip({
                                    position: { my: "left top", at: "left-53 top-65", of: pin },
                                    content: (function(){
                                        return $(pin).attr('title');
                                    })()
                                });

                                $(this).append('<div class="progressbar"></div>');
                                var progressBar = $(this).children('.progressbar');

                                $(progressBar).progressbar({
                                    value: rounded_percent
                                });
                                if(rounded_percent >= 111){
                                    pin_buffer = rounded_percent * 0.05;
                                    bar_buffer = rounded_percent * 0.4;
                                    $(pin).css('right', 30 + pin_buffer + '%');
                                    $(progressBar).children('.ui-widget-header').css('background-color','#bb382b');
                                    $(progressBar).css('width', rounded_percent - bar_buffer +'%');
                                }

                                if(rounded_percent >= 91 && rounded_percent <= 110){
                                    pin_buffer = rounded_percent * 0.05;
                                    bar_buffer = rounded_percent * 0.225;
                                    $(pin).css('right', 17 + pin_buffer + '%');
                                    $(progressBar).children('.ui-widget-header').css('background-color','#e5b730');
                                    $(progressBar).css('width', rounded_percent - bar_buffer +'%');
                                }

                                if(rounded_percent <= 90){
                                    pin_buffer = rounded_percent * 0.05;
                                    bar_buffer = rounded_percent - 77;
                                    $(pin).css('right', 17 + pin_buffer + '%');
                                    $(progressBar).children('.ui-widget-header').css('background-color','#18b697');
                                    $(progressBar).css('width', rounded_percent - bar_buffer +'%');
                                }
                            });
                        });

                        $('<div class="time_info"></div>').appendTo($(this)).append(function(){
                            $(this).append(' <p class="remaining">' + remaining_weeks + 'w ' + remaining_days + 'd ' + remaining_hours + 'h ' + remaining_minutes + 'm </p>');
                            $(this).append(' <p class="elapsed">' + elapsed_weeks + 'w ' + elapsed_days + 'd ' + elapsed_hours + 'h ' + elapsed_minutes + 'm </p>');
                        });
                    });
                });
            });

            //populates the the viewer when it's in the closed position
            $(project_tasks[index]).each(function(){
                var avatar = this.userAvatar;
                var rounded_percent = this.rounded_percent;

                if(rounded_percent  <= 90){
                    $(user_template).appendTo($(project_closed_div)).append(function(){
                        $(this).addClass('green');
                        $(this).append('<img src='+ avatar +' class="green">');
                        $(this).append('<span class="percentage"> ' + rounded_percent + '</span>');
                    });
                }

                if(rounded_percent >= 91 && rounded_percent <= 110){
                    $(user_template).appendTo($(project_closed_div)).append(function(){
                        $(this).addClass('yellow');
                        $(this).append('<img src='+ avatar +' class="yellow">');
                        $(this).append('<span class="percentage"> ' + rounded_percent + '</span>');
                    });
                }

                if(rounded_percent >= 111){
                    $(user_template).appendTo($(project_closed_div)).append(function(){
                        $(this).addClass('red');
                        $(this).append('<img src='+ avatar +' class="red">');
                        $(this).append('<span class="percentage"> ' + rounded_percent + '</span>');
                    });
                }
            });
        });
    }

    createClosedView();
    createOpenView();

    //Refreshes Viewers every minute
    /*setInterval(function(){
        $('#proj_summary').find('.quick_view').remove();
        $('.projects_container').find('.user').remove();
        $('.projects_container').find('.user_container').remove();
        createClosedView();
        createOpenView();
        console.log('refreshed');
    },60000);*/
}

