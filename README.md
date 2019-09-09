# MediaFragmentRecorder
Record media fragments in browser

Motivation: [OfflineMediaContext](https://github.com/guest271314/OfflineMediaContext#offlinemediacontext), 
            [How to use Blob URL, MediaSource or other methods to play concatenated Blobs of media fragments?](https://stackoverflow.com/questions/45217962/how-to-use-blob-url-mediasource-or-other-methods-to-play-concatenated-blobs-of)

`$ ffmpeg -i concat:"int.mpg|int1.mpg" -c copy int_all.mpg`, `$ ffmpeg -i int_all.mpg -qscale:v 2 mix.webm`

`$ mkvmerge -w -o int_all.webm int.webm + int1.webm`

[Branches of this repository](https://github.com/guest271314/MediaFragmentRecorder/branches)
