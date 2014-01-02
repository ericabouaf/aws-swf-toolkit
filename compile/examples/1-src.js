
var a = 1;

var pickImage = localtask({
      
        "data": {
          text: "young children playing outside",
          image_urls: [
            { src: "http://i.istockimg.com/file_thumbview_approve/12122839/2/stock-photo-12122839-excited-children-playing.jpg" },
            { src: "http://i.istockimg.com/file_thumbview_approve/13702506/2/stock-photo-13702506-children-playing-ball.jpg"},
            { src: "http://i.istockimg.com/file_thumbview_approve/12010229/2/stock-photo-12010229-children-playing-girls-versus-boys-tug-of-war-game-outside.jpg"}
          ]
        },

        template: file('./pick-image/pick-image.html')
});


stop({
  label: "finished !",
  data: pickImage
});
