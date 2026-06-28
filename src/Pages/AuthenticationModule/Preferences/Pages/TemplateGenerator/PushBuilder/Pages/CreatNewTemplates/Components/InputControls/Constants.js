export const BODYCONFIG = {
    selector: '.textArea',
    menubar: false,
    inline: true,
    plugins: ['lists'],
    toolbar: [
        ' fontfamily fontsize | bold italic underline  | image link',
        'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent',
    ],
    valid_elements:
        'p[style],strong,em,span[style],a[href],ul,ol,li,font[face|size|color|style],span[style],p[style],-ol[type|start],-ul[type],-li',
    valid_styles: {
        '*': 'font-size,font-family,color,text-decoration,text-align',
    },
    extended_valid_elements:
        'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
    powerpaste_word_import: 'clean',
    powerpaste_html_import: 'clean',
    paste_data_images: false,
};