
var a = 1;
if (!scheduled("localtask_1")) {
    schedule({
        "name": "localtask_1",
        "activity": "localtask",
        "input": {
            "data": {
                text: "young children playing outside",
                image_urls: [
                    { src: "http://i.istockimg.com/file_thumbview_approve/12122839/2/stock-photo-12122839-excited-children-playing.jpg" },
                    { src: "http://i.istockimg.com/file_thumbview_approve/13702506/2/stock-photo-13702506-children-playing-ball.jpg" },
                    { src: "http://i.istockimg.com/file_thumbview_approve/12010229/2/stock-photo-12010229-children-playing-girls-versus-boys-tug-of-war-game-outside.jpg" }
                ]
            },
            template: file("./pick-image/pick-image.html")
        }
    });
}
if (completed("localtask_1")) {
    stop({
        label: "finished !",
        data: "blablah"
    });
}