import Simple from './Simple';

unlayer.registerTool({
    name: 'my_tool',
    label: 'My Tool',
    icon: 'fa-smile',
    supportedDisplayModes: ['web', 'email'],
    options: {},
    values: {},
    renderer: {
        Viewer: Simple, // our React Viewer
        exporters: {
            web: function (values) {
                return '<div>I am a custom tool.</div>';
            },
            email: function (values) {
                return '<div>I am a custom tool.</div>';
            },
        },
        head: {
            css: function (values) { },
            js: function (values) { },
        },
    },
});
