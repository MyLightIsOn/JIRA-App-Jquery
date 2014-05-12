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

                //Converts original estimates into minutes
                    orig_taskWeeks = this.origEstimate_weeks * 10080,
                    orig_taskDays = this.origEstimate_days * 1440,
                    orig_taskHours = this.origEstimate_hours * 60,
                    orig_taskMinutes = this.origEstimate_minutes,
                    task_progress = moment(this.task_in_progress);

                this.elapsed_total = Math.round(now.diff(task_progress, 'minutes', true));                  //Minutes elapsed since task was in progress
                this.orig_total = orig_taskWeeks + orig_taskDays + orig_taskHours + orig_taskMinutes;       //Total number of minutes allocated
                percentage_used = (((Math.round((this.elapsed_total / this.orig_total)*100)/100)) * 100);   //Percentage of time used
                this.rounded_percent = Math.round(percentage_used);                                         //Percentage of time rounded
                rounded_percent = this.rounded_percent;
                this.elapsed_total = this.elapsed_total + 1000;

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
                    orig_minute = this.origEstimate_minutes;

                $(viewer_template).appendTo($(project_open_div)).append(function(){
                    $(this).append('<img src='+ avatar +'><span class="user_name">' + user + '</span>');
                    $('<div class="task_details"></div>').appendTo($(this)).append(function(){

                        $(this).append('<div class="task_title">' + taskName + '</div>');
                        $(this).append('<p class="task_percent">' + rounded_percent + '</p>');
                        $(this).append(function(){
                            $(this).append('<div class="progressbar"></div>');
                            var progressBar = $(this).children('.progressbar');

                            $(progressBar).progressbar({
                                value: rounded_percent
                            });
                            if(rounded_percent >= 111){
                                $(progressBar).children('.ui-widget-header').css('background-color','#bb382b');
                            } else

                            if(rounded_percent >= 91 && rounded_percent <= 110){
                                $(progressBar).children('.ui-widget-header').css('background-color','#e5b730');
                            }

                            if(rounded_percent <= 90){
                                $(progressBar).children('.ui-widget-header').css('background-color','#18b697');
                            }
                        });
                        $('<div class="time_info"></div>').appendTo($(this)).append(function(){
                            $(this).append(' <p class="elapsed">' + orig_week + 'w ' + orig_day + 'd ' + orig_hour + 'h ' + orig_minute + 'm </p>');
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
    setInterval(function(){
        $('#proj_summary').find('.quick_view').remove();
        $('.projects_container').find('.user').remove();
        $('.projects_container').find('.user_container').remove();
        createClosedView();
        createOpenView();
        console.log('refreshed');
    },60000);
}

