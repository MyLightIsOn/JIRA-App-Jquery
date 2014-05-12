var main = function () {

    $.ajax({
        url: '/progressViewer.json',
        dataType: 'json',
        success : function(data){
            process_data(data);
        }
    });

    function process_data(data){
        var projects_db,
            project_names = [],
            project_avatar = [],
            project_users = [],
            project_tasks = [],
            task_name = [],
            task_orig_time = [],
            task_elapsed_time = [],
            orig_total = [],
            elapsed_total = [],
            rounded_percent = [],
            percentage_complete = [],
            quickView_percent = [],
            i;

        projects_db = data[0].projects; //gets project data

        //gets each projects name, avatar, and users
        for(i = 0; i<projects_db.length; i++){
            project_names.push(data[0].projects[i].projectName);
            project_avatar.push(data[0].projects[i].projectAvatar);
            project_users.push(data[0].projects[i].projectUsers);
        }

        //puts project tasks in an array
        for(i = 0; i<project_users.length; i++){
            $.each(project_users[i], function(){
                project_tasks.push(this.projectTasks);
            });
        }

        //puts project details in an array
        for(i = 0; i<project_tasks.length; i++){
            $.each(project_tasks[i], function(){
                task_name.push(this.taskName);
                task_orig_time.push(this.origEstimate)
                task_elapsed_time.push(this.elapsedTime)
            });
        }

        //puts original estimate totals in array
        for(i = 0; i<task_orig_time.length; i++){
            $.each(task_orig_time[i], function(){
                var orig_taskWeeks = this.weeks * 10080;
                var orig_taskDays = this.days * 1440;
                var orig_taskHours = this.hours * 60;
                var orig_taskMinutes = this.minutes;

                orig_total.push(orig_taskWeeks + orig_taskDays + orig_taskHours + orig_taskMinutes);
            });
        }

        //puts elapsed time totals in array
        for(i = 0; i<task_elapsed_time.length; i++){
            $.each(task_elapsed_time[i], function(){
                var elapsed_taskWeeks = this.weeks * 10080;
                var elapsed_taskDays = this.days * 1440;
                var elapsed_taskHours = this.hours * 60;
                var elapsed_taskMinutes = this.minutes;

                elapsed_total.push(elapsed_taskWeeks + elapsed_taskDays + elapsed_taskHours + elapsed_taskMinutes);
            });
        }

        //applies math to time arrays to get percentages
        for(i = 0; i<orig_total.length; i++){
            rounded_percent.push(((Math.round((elapsed_total[i] / orig_total[i])*100)/100)) * 100); //rounds down percentage
            percentage_complete.push(Math.round(rounded_percent[i]*100)/100);
        }


        //puts percentages into an array
        for(i = 0; i<project_tasks.length; i++){
            $.each(project_tasks[i], function(){
                quickView_percent.push(this);
            });
        }

        //gives each task is completion percentage
        for(i = 0; i<quickView_percent.length; i++){
            quickView_percent[i].percent = percentage_complete[i];
            /*console.log(quickView_percent[i].taskName);
             console.log(quickView_percent[i].percent);*/
        }

        console.log(project_users);
        /*for(i = 0; i<project_users.length; i++){
         $.each(project_users[i], function(){
         $.each(this.projectTasks, function(){
         console.log(this.taskName);
         console.log(this.percent);
         if(this.percent >= 111){
         console.log('higher');
         }
         if(this.percent >= 91 && this.percent <= 110){
         console.log('middle');
         }
         if(this.percent <= 90){
         console.log('lower');
         }
         });
         });
         }*/

        /*$.each(projects_db, function(){
         var project_template = $('.project_template').html();
         $('.projects').removeClass('hidden');
         $('.projects_container').append(project_template);
         });
         */
        /*$.each(project_tasks, function(project_users){
         task_name = this.taskName;
         task_orig_time = this.origEstimate;
         task_elapsed_time = this.elapsedTime;
         };*/
    }
};



$(document).ready(main);

$('.project_toggle').click(function(){
    var i,
        projectsArray,
        openClose,
        projectOpen,
        progressBarPercent,
        projectUsers,
        projectTasks,
        projectTask_percentage,
        getPercent;

    projectsArray = $(this).parent();                           //project header
    openClose = projectsArray.siblings();                       //proj_open and proj_closed divs
    projectOpen = openClose[1];                                 //proj_open div
    projectUsers = $(projectOpen).children();                   //People assigned to project
    projectTasks = $(projectUsers).children('.task_details');   //Tasks in progress for person assign
    progressBarPercent = [];                                    //Array of progress bars
    getPercent = projectTasks.children('.progressbar');         //progress bar divs

    //Opens and closes projecs
    $(this).toggleClass('open');
    for (i=0; i<openClose.length; i++)
    {
        $(openClose[i]).toggleClass('hidden');
    }

    //Sets progress bars length and color
    for (i=0; i<projectTasks.length; i++)
    {
        projectTask_percentage = parseInt($(projectTasks[i]).children('.task_percent').html());
        progressBarPercent.push(projectTask_percentage);
        $(getPercent[i]).progressbar({
            value: progressBarPercent[i]
        });

        if(projectTask_percentage >= 111){
            $(getPercent[i]).children('.ui-widget-header').css('background-color','#bb382b');
        }

        if(projectTask_percentage >= 91 && projectTask_percentage <= 110){
            $(getPercent[i]).children('.ui-widget-header').css('background-color','#e5b730');
        }

        if(projectTask_percentage <= 90){
            $(getPercent[i]).children('.ui-widget-header').css('background-color','#18b697');
        }
    }
});
