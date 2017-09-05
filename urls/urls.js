
    const multipleUrls = [
      "https://media.w3.org/2010/05/sintel/trailer.mp4#t=0,5",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=55,60",
      "https://raw.githubusercontent.com/w3c/web-platform-tests/master/media-source/mp4/test.mp4#t=0,5",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4#t=0,5",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4#t=0,5",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4#t=0,6",  
      "https://media.w3.org/2010/05/video/movie_300.mp4#t=30,36"
    ];

    const singleUrl = [
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=0,1",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=1,2",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=2,3",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=3,4",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=4,5",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=5,6",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=6,7",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=7,8",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=8,9",
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4#t=9,10"
    ];
    // firefox bug with more than five URLs
    // last loop does not complete
    const geckoUrl = [
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=10,11",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=11,12",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=12,13",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=13,14"/*,
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=14,15",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=15,16",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=16,17",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=17,18",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=18,19",
      "https://mirrors.creativecommons.org/movingimages/webm/ScienceCommonsJesseDylan_240p.webm#t=19,20"
    */];
