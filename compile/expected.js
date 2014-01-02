
if( has_workflow_just_started() ) {
  schedule({
    name: 'step1',
    activity: 'localtask',

    input: {

      /*
       mturk: {
          title : "Vote on Text Improvement",
          description : "Decide which two small paragraphs is closer to a goal.",
          reward : 0.01,
          duration: 3600, // 1 hour
          maxAssignments : 1
        },*/
        

       // or


        /*emailNotification: {
            to: "eric.abouaf@gmail.com",
            subject: "Ceci est un test !"
        },*/
        

        "data": {
          text: "young children playing outside",
          image_urls: [
            { src: "http://i.istockimg.com/file_thumbview_approve/12122839/2/stock-photo-12122839-excited-children-playing.jpg" },
            { src: "http://i.istockimg.com/file_thumbview_approve/13702506/2/stock-photo-13702506-children-playing-ball.jpg"},
            { src: "http://i.istockimg.com/file_thumbview_approve/12010229/2/stock-photo-12010229-children-playing-girls-versus-boys-tug-of-war-game-outside.jpg"}
          ]
        },

        template: file('./pick-image/pick-image.html')

    }
  });
}


if( completed('step1') ) {
  stop({
    result: {
      label: "finished !",
      data: results('step1')
    }
  });
}
