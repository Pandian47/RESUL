import { iconImage, iconLeftCaption, iconRightCaption, iconSocialFollow, iconText, logoVisionBank, placeholderImage } from 'Assets/Images';
import { builder_image_large, builder_left_caption_large, builder_right_caption_large, builder_right_text_large, builder_social_share_large } from 'Constants/GlobalConstant/Glyphicons';
import SOCIAL_ICONS from './SocialFollows/constant';

const showDropdownData = (totalArray, uniqueArray) => {
    let getArray = [...totalArray].filter((e, i) => {
        if (!uniqueArray.some((ee) => ee.id == e.id)) {
            return e;
        }
    });
    return getArray;
};

function handleFilePicker(callback, value, meta, handleImageUpload) {
    // debugger;
    // Open your file picker dialog here
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        // Use FileReader to read the file and get its data URL
        const reader = new FileReader();
        var url = '',
            b64 = '',
            format = '',
            size = 0;
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            // Pass the data URL back to TinyMCE using the callback function

            (format = file?.name?.split('.')?.pop()?.toLocaleLowerCase()), (size = file?.size);
            // debugger;

            // await getFileToBase64(
            //     file,
            //     (base64) => {
            //         b64 = base64;
            //         // url = await handleImageUpload(
            //         //     file?.name?.split('.')?.pop()?.toLocaleLowerCase(),
            //         //     base64,
            //         //     file.size,
            //         // );
            //     },
            //     (err) => console.log(err),
            //     // isRaw,
            // );
            b64 = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
            url = await handleImageUpload(format, b64, size);
            // console.log('URL :::::: ', reader, url, url?.length);

            callback(url, {
                alt: file.name,
                title: file.name,
                src: url,
            });
            // reader.onloadend = () => {

            //     callback(reader.result, {
            //         alt: file.name,
            //         title: file.name,
            //         src: url,
            //     });
            // };
        };
    };
    // input.onblur = async () => {
    //     url = await handleImageUpload(format, b64, size);
    //     console.log('URL :::::: ', reader, url);
    //     callback(url, {
    //         alt: file.name,
    //         title: file.name,
    //         // src: url,
    //     });
    // };
    input.click();

    // input.on;
}

const clickableClass = 'my-clickable-class';

const BODYCONFIG = (handleImageUpload) => {
    return {
        selector: '.tiny',
        menubar: false,
        inline: true,
        resize: false,
        plugins: ['link', 'lists', 'autolink', 'image', 'textcolor', 'colorpicker'],
        toolbar: [
            ' fontfamily fontsize | bold italic underline  | image link',
            'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent',
        ],
        noneditable_noneditable_class: 'mceNonEditable',
        noneditable_editable_class: 'mceEditable',
        noneditable_regexp: /^[\s\t\r\n]*$/,
        noneditable_clickable_class: clickableClass,
        paste_data_images: false,
        content_style: `
              .${clickableClass} {
                cursor: pointer;
                color: #333;
                background-color: #f5f5f5;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 5px;
              }
            `,
        setup: function (editor) {
            editor.on('click', function (e) {
                if (e.target.classList.contains('my-clickable-class')) {
                    editor.setMode('design');
                }
            });
        },
        file_picker_types: 'image',
        file_picker_callback: (callback, value, meta) => handleFilePicker(callback, value, meta, handleImageUpload),

        // valid_elements:
        //     'p[style],table[style],tbody[style],tr[style],td[style],strong,em,span[style],a[href],ul,ol,li,font[face|size|color|style],span[style],p[style],-ol[type|start],-ul[type],-li',
        // valid_styles: {
        //     '*': 'font-size,font-family,color,text-decoration,text-align',
        // },
        // extended_valid_elements:
        //     'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
        powerpaste_word_import: 'clean',
        powerpaste_html_import: 'clean',
    };
};

const BODYCONFIGIMAGE = {
    menubar: false,
    inline: true,
    plugins: '',
    toolbar: '',
    //content_css: ' # mce-content-body { display: flex }',
    content_css: '',
    // file_picker_types: 'image',
    // content_style: '.my-editor .mce-content-body { display: flex !important; }',
    // file_picker_callback: handleFilePicker,
};

// const CONTENTTEXT = `
//    <div>
//    <span><a href="Forward%20to%20friends">Forward to friends </a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <a href="Update%20your%20profile">&nbsp;Update your profile</a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<a href="Unsubscribe">Unsubscribe</a></span>
//    </div>`;

const CONTENTNAVIGATION = `<!--[if mso]><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td valign="top" width="600"><![endif]--><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%">
    <tbody>
        <tr>
            <td class="textBlock" align="center" style="padding: 5px 0; text-align:center;" ><div class="content-wrapper"><a href="{{#FTF}}">Forward to friends</a> | <a href="{{#UNSUB}}">Unsubscribe</a></div></td> 
        </tr>
    </tbody>
</table><!--[if mso]></td></tr></table><![endif]-->`;

const CONTENTTEXT = `<!--[if mso]><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td valign="top" width="600"><![endif]--><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%">
    <tbody>
        <tr>
            <td class="textBlock" align="left" style="padding:10px; line-height: normal;  width: 600px;"><div class="content-wrapper">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</div></td>
        </tr>
    </tbody>
</table><!--[if mso]></td></tr></table><![endif]-->`;

const CONTENTCOMMON = `<!--[if mso]><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td valign="top" width="600"><![endif]--><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%">
    <tbody>
        <tr>
            <td width="300" align="right" valign="middle" style="padding:10px;"><img src=${logoVisionBank}} border="0" style="height: auto; max-width: 100%;"></td>
            <td class="textBlock" width="300" align="left" valign="middle" style="padding:10px">
                <p style="padding: 0; margin: 0; line-height: normal;">Vision bank</p>
                <p style="padding: 0; margin: 0; line-height: normal;">350, 5th Avenue, 34th Floor, New York, USA</p>
            </td>
        </tr>
    </tbody>
</table><!--[if mso]></td></tr></table><![endif]-->`;

 

const CONTENTRIGHT = `<!--[if mso]><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td valign="top" width="600"><![endif]--><table align="right" border="0" cellspacing="0" cellpadding="0" width="100%">
    <tbody>
        <tr>
            <td class="textBlock" width="400"  align="left" valign="middle" style="padding:10px; width: 400px;" id="contentRigntID">
            <div class="content-wrapper">
                <p style="padding: 0; margin: 0; line-height: normal;">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod</p></div>
            </td>
            <td width="200" align="left" valign="middle" style="padding:10px; width: 200px; " class='contentRightImg'><img src=${placeholderImage} border="0" style="height: auto; max-width: 100%;" /></td>
        </tr>
    </tbody>
</table><!--[if mso]></td></tr></table><![endif]-->`;

const CONTENTLEFT = `<!--[if mso]><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td valign="top" width="600"><![endif]--><table align="left" border="0" cellspacing="0" cellpadding="0" width="100%">
    <tbody>
        <tr>
            <td width="200" align="left" valign="middle" style="padding:10px; width: 200px; " class='contentLeftImg'><img src=${placeholderImage} border="0" style="height: auto; max-width: 100%;"/></td>
            <td class="textBlock" width="400" align="left" valign="middle" style="padding:10px; width: 400px;">
            <div class="content-wrapper">
               <p style="padding: 0; margin: 0; line-height: normal;">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod</p></div>
            </td>
        </tr>
    </tbody>
</table><!--[if mso]></td></tr></table><![endif]-->`;

const CONTENTIMAGE = `<!--[if mso]><table border="0" cellpadding="0" cellspacing="0"><tr><td valign="top"><![endif]--><table align="center" border="0" cellspacing="0" cellpadding="0" width="100%" style="text-align: center; margin: auto;">
    <tbody>
        <tr>
            <td align="center" valign="middle" style="padding:10px; text-align: center; display: table;" class='contentLeftImg'><img src=${placeholderImage} border="0" style="height: auto; max-width: 100%;"/></td>
           
        </tr>
    </tbody>
</table><!--[if mso]></td></tr></table><![endif]-->`;

const ICONLIST = [
    {
        id: 4,
        content: 'Text',
        icon: builder_right_text_large,
        elementImage: `${iconText}`,
    },
    {
        id: 6,
        content: 'Image',
        icon: builder_image_large,
        elementImage: `${iconImage}`,
    },
    {
        id: 2,
        content: 'Left caption',
        icon: builder_left_caption_large,
        elementImage: `${iconLeftCaption}`,
    },
    {
        id: 3,
        content: 'Right caption',
        icon: builder_right_caption_large,
        elementImage: `${iconRightCaption}`,
    },
    {
        id: 5,
        content: 'Social follow',
        icon: builder_social_share_large,
        elementImage: `${iconSocialFollow}`,
    },
];

export {
    showDropdownData,
    BODYCONFIG,
    CONTENTTEXT,
    CONTENTNAVIGATION,
    CONTENTRIGHT,
    CONTENTCOMMON,
    CONTENTLEFT,
    CONTENTIMAGE,
    BODYCONFIGIMAGE,
    ICONLIST,
};

const convertElementToArray = (data, setSocialContentAll) => {
    //debugger
    // debugger;
    //console.log("data",data)
    var result = [],
        social = [];
    let tempElement = data?.firstChild;
    //console.log('First element ::: ', tempElement);
    const firstId = SOCIAL_ICONS?.filter(
        (item) => item?.title === tempElement.lastChild.lastChild.lastChild.lastChild.getAttribute('id'),
        // (item) => item?.title === tempElement.lastChild.getAttribute('id'),
    )?.[0];
    result.push({
        id: 1,
        text: firstId,
        title: tempElement.lastChild.lastChild.lastChild.lastChild.getAttribute('id'),
        link: tempElement.lastChild.lastChild.lastChild.getAttribute('id'),
        icon: firstId?.icon,
    });
    social.push(
        SOCIAL_ICONS?.filter(
            (item) => item?.title === tempElement.firstChild.lastChild.lastChild.getAttribute('id'),
        )?.[0],
    );
    // for (var i = 0; i < data.childNodes?.length; i++) {
    for (var i = 0; i < data.childNodes?.length; i++) {
        // element.append(firstSibling.nextSibling);
        if (i !== 0) {
            // let tempData = tempElement.nextSibling.lastChild;
            // console.log('Temp data ::: ', tempData);
            // let temp = {
            //     id: tempData.id,
            //     text: tempData.text,
            // };
            // const id = tempElement.nextSibling.lastChild.lastChild.lastChild?.getAttribute('id');
            // const link = tempElement.nextSibling.lastChild.lastChild.getAttribute('id');
            const id = tempElement.nextSibling.lastChild.lastChild.lastChild.lastChild.getAttribute('id'); //data.firstChild.firstChild.firstChild.cells[0].lastChild.lastChild.lastChild.lastChild.getAttribute('id')
            const link = tempElement.nextSibling.lastChild.lastChild.lastChild.getAttribute('id'); //data.firstChild.firstChild.firstChild.cells[0].lastChild.lastChild.lastChild.getAttribute('id')
            const text = SOCIAL_ICONS?.filter((item) => item?.title === id)?.[0];
            result.push({
                id: i + 1,
                text: text,
                title: id,
                link: link,
                icon: text?.icon,
            });
            social.push(SOCIAL_ICONS?.filter((item) => item?.title === id)?.[0]);
            tempElement = tempElement.nextSibling;
            // containerData.push(temp);
        }
    }
    //console.log('result ::: ', result);
    setSocialContentAll(result);
    return result;
};

const checkContainerType = (data, setSocialContentAll) => {
    let text = data.id;

    if (text.includes('Navigation')) {
        return {
            id: 1,
            text: data.lastChild.firstChild.lastChild.outerHTML,
        };
    } else if (text.includes('Right')) {
        return {
            id: 2,
            text: data.lastChild.firstChild.lastChild.outerHTML,
        };
    } else if (text.includes('Left')) {
        return {
            id: 3,
            text: data.lastChild.firstChild.lastChild.outerHTML,
        };
    } else if (text.includes('Text')) {
        return {
            id: 4,
            text: data.lastChild.firstChild.lastChild.outerHTML,
        };
    } else if (text.includes('Social')) {
        // console.log('Social ::::: ', data.lastChild.firstChild.lastChild, data.lastChild);
        return {
            id: 5,
            text: convertElementToArray(data.lastChild.firstChild.firstChild.firstChild, setSocialContentAll),
            // text: convertElementToArray(data.lastChild, setSocialContentAll),
        };
    } else {
        return {
            id: 4,
            text: data.lastChild.firstChild.lastChild.outerHTML,
        };
    }
};

export const buildEditData = (data, setSocialContentAll, setTableBG) => {
    //console.log('data: ', data);
    // var innerData = data?.split("<table id=\"cardId\" width=\"100%\" style=\"background-color: rgb(255, 255, 255);\"><tbody><tr><td>");
    var ele = document.createElement('div');
    // var element = document.createElement('div');
    const parser = new DOMParser();
    const html = parser.parseFromString(data, 'text/html');
    const body = html.body;
    ele.innerHTML = data;
    const tableValue = ele?.lastChild?.lastChild?.lastChild?.lastChild?.lastChild?.lastChild?.lastChild?.lastChild;
    setTableBG(
        ele?.lastChild?.firstChild?.firstChild?.firstChild?.firstElementChild
            ?.getAttribute('style')
            ?.split(';')[0]
            .split(':')[1]
            .trim(),
    );

    const firstSibling = tableValue.firstChild;
    var elementFirst = firstSibling.lastChild;
    var containerData = [];

    // element.appendChild(firstSibling);
    let tempFirstData = checkContainerType(elementFirst, setSocialContentAll);
    containerData.push({
        id: tempFirstData.id,
        text: tempFirstData.text,
    });
    let tempElement = firstSibling;
    for (var i = 0; i < tableValue?.childNodes?.length; i++) {
        // element.append(firstSibling.nextSibling);
        if (i !== 0) {
            let tempData = checkContainerType(tempElement.nextSibling.lastChild, setSocialContentAll);
            // console.log('Temp data ::: ', tempData);
            let temp = {
                id: tempData.id,
                text: tempData.text,
            };
            tempElement = tempElement.nextSibling;
            containerData.push(temp);
        }
    }
    // console.log('Check ::: ', body, tableValue, firstSibling.nextSibling, firstSibling);
    // console.log('Container dagta :::: ', containerData);
    return containerData;
};
