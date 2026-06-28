export const WHITELISTING = ['162.134.21.152', '192.201.91.35', '192.189.221.135'];

export const INITIAL_STATE = {
    sel_attributes: [],
    sel_events: [],
    showAttributesModal: false,
    showEventsModal: false,
    // show: false,
    // showModal: {
    //     attributes: { attributes: [], show: false },
    //     events: { attributes: [], show: false },
    // },
};

export const INITIAL_STATE_FORM = {
    defaultValues: {
        pageGrid: [],
    },
};
export const buildPayload = (data, payload) => {
    let { AppPermission, Attributes, Events, InboxClassification = [], WhitelistThrottling } = data;
    let inbox = InboxClassification?.map((ele, ind) => {
        let result = payload?.inboxClassification.find((item) => item.classificationId === ele);
        if (result) {
            return { ...result };
        } else {
            return { cdId: 0, classificationId: ele, isActive: true };
        }
    });
    let inboxMerge = [...inbox, ...payload?.inboxClassification];
    let inboxCheck = Object.values(
        inboxMerge.reduce((acc, item) => {
            acc[item.classificationId] = acc[item.classificationId] || item;
            return acc;
        }, {}),
    );

    let eventsMerge = [...Events, ...payload?.events.assigned];
    let eventsCheck = Object.values(
        eventsMerge.reduce((acc, item) => {
            acc[item.eventId] = acc[item.eventId] || item;
            return acc;
        }, {}),
    );
    let attributeMerge = [...Attributes, ...payload?.attributes?.additional?.assigned];
    let attributeCheck = Object.values(
        attributeMerge.reduce((acc, item) => {
            acc[item.attributeId] = acc[item.attributeId] || item;
            return acc;
        }, {}),
    );

    return {
        ...data,
        AppPermission: AppPermission?.map(({ appId, appName, isActive }) => ({
            appId,
            appname: appName,
            isActive,
        })),
        Attributes: attributeCheck?.map(({ attributeId, attributeName, attributeType, selected, adId }) => ({
            adId: adId ? adId : 0, // attributeId,
            attributeId: attributeId,
            attributeName: attributeName,
            isActive: Attributes.some((e) => e.adId === adId),
        })),
        Events: eventsCheck?.map(({ eventId, eventName, selected, edId }) => ({
            edId: edId ? edId : 0, //eventId
            eventId: eventId,
            isActive: Events.some((e) => e.edId === edId),
        })),
        WhitelistThrottling,
        InboxClassification: inboxCheck?.map(({ cdId, classificationId, isActive }) => ({
            cdId,
            classificationId,
            isActive: InboxClassification.some((e) => e === classificationId),
        })),
    };
};
