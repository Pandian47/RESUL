// Dependency-free audience footer menu labels (avoids Placeholders circular imports in prod bundles).
export const AUDIENCE_FOOTER_LABELS = Object.freeze({
    DUPLICATE: 'Duplicate',
    DOWNLOAD: 'Download',
    ARCHIVE: 'Archive',
    UNARCHIVE: 'Unarchive',
    CONTROL_GROUP_TARGET: 'Control group/target group',
    MATCH_INPUT_LIST_TARGET: 'Match input list',
    SUPPRESSION_INPUT_LIST_TARGET: 'Suppression input list',
    DOWNLOAD_SHARE: 'Download/Share',
    DATA_AUGMENTATION_ENRICH: 'Data augmentation/enrichment',
});

export const getDynamicListFooterData = (isArchived = false) => [
    AUDIENCE_FOOTER_LABELS.DUPLICATE,
    AUDIENCE_FOOTER_LABELS.DOWNLOAD,
    isArchived ? AUDIENCE_FOOTER_LABELS.UNARCHIVE : AUDIENCE_FOOTER_LABELS.ARCHIVE,
];

export const getTargetListFooterData = (isArchived = false) => [
    AUDIENCE_FOOTER_LABELS.DUPLICATE,
    AUDIENCE_FOOTER_LABELS.CONTROL_GROUP_TARGET,
    AUDIENCE_FOOTER_LABELS.MATCH_INPUT_LIST_TARGET,
    AUDIENCE_FOOTER_LABELS.SUPPRESSION_INPUT_LIST_TARGET,
    AUDIENCE_FOOTER_LABELS.DOWNLOAD_SHARE,
    AUDIENCE_FOOTER_LABELS.DATA_AUGMENTATION_ENRICH,
    isArchived ? AUDIENCE_FOOTER_LABELS.UNARCHIVE : AUDIENCE_FOOTER_LABELS.ARCHIVE,
];
