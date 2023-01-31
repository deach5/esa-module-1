var rebus = rebus || {};
/**
@name rebus.config
@description
<pre>
    pages - page:
        path: String - a path relative to the current page; e.g. 'p1', '../p1' (go back), '/p2' (go to root)
        title: String
        hideHeader: Boolean
        hideHeaderTitle: Boolean
        redirectIfTopicComplete: String - a path, relative to the orginal page, to redirect to if the topic is complete
                                          e.g. a module assessment may redirect to the module completion page
</pre>
*/
rebus.config = {
    title: 'What is explicit teaching?', // Used my progress modal
    id: 'esa-explicit-m1-20220828', // Used for generating a unique cookie for local testing
    useLMS: true,
    debug: false,
    debugTypes: '*',
    takeModulesInOrder: true,
    takeTopicsInOrder: true,
    takePagesInOrder: true,
    includeProgressModal: false,
    videosMustBePlayedThrough: true,
    useDefaultPDFViewerForBrowser: false,
    windowResize: "fullscreen",
    mozillaPDFViewerLinks: 'disabled', // 'disabled' | 'open-new-window'. If not set, they will be active and open in the current window.
    pages: [

        {
            type: 'modules',
            modules: [{
                folder: 'm1',
                title: 'What is explicit teaching?',
                pages: [
                    { path: 'landing', title: 'What is explicit teaching?', htmlTitle: 'What is explicit teaching?', hideHeaderTitle: true },                    
                    { path: 'menu', title: 'What is explicit teaching?', type: 'menu', hideHeaderTitle: true },
                    {
                        type: 'topics',
                        topics: [                        
                            {
                                folder: 't1',
                                title: 'What is explicit teaching?',
                                pages: [
                                    { path: 'p1', title: 'What is explicit teaching?' }
                                ]
                            },
                            {
                                folder: 't2',
                                title: 'The essential components of explicit teaching',
                                pages: [{ path: 'p1', title: 'The essential components of explicit teaching' }]
                            }
                        ]
                    }
                ]
            }]
        }
    ]
};