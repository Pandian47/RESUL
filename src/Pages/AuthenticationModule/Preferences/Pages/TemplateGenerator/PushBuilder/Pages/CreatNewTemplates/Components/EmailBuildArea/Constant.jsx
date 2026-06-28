import { Fragment } from 'react';
import { iconPim } from "Assets/Images";
import EBInput from "../InputControls/EBInput";
import EBButton from "../InputControls/EBButton";
import SingleColumnContainer from "./Components/RowContainers/SingleColumnContainer";

export const DROP_TEXT_CONTENT = "Drop content here";

export const TEMPLATE_BLOCKS = [
  {
    id: 1,
    name: "One",
    component: (props) => <SingleColumnContainer {...props} />,
  },
  {
    id: 2,
    name: "Two",
    component: (props) => <SingleColumnContainer {...props} />,
  },
  {
    id: 3,
    name: "Three",
    component: (props) => <SingleColumnContainer {...props} />,
  },
  {
    id: 4,
    name: "Four",
    component: (props) => <SingleColumnContainer {...props} />,
  },
  {
    id: 5,
    name: "Five",
    component: (props) => <SingleColumnContainer {...props} />,
  },
  {
    id: 6,
    name: "Six",
    component: (props) => <SingleColumnContainer {...props} />,
  },
];

export const TEMPLATE_COMPONENTS = [
  {
    id: 1,
    name: "AMP",
    icons: iconPim,
    component: () => <Fragment>amp</Fragment>,
  },
  {
    id: 2,
    name: "Blocks",
    icons: iconPim,
    component: () => <Fragment>block</Fragment>,
  },
  {
    id: 3,
    name: "Text",
    icons: iconPim,
    component: (props) => <EBInput {...props} />,
  },
  {
    id: 4,
    name: "Button",
    icons: iconPim,
    component: (props) => <EBButton {...props} />,
  },
  {
    id: 5,
    name: "Offer",
    icons: iconPim,
    component: () => <Fragment>Offer</Fragment>,
  },
  {
    id: 6,
    name: "Divider",
    icons: iconPim,
    component: () => <Fragment>Divider</Fragment>,
  },
  {
    id: 7,
    name: "Spacer",
    icons: iconPim,
    component: () => <Fragment>Spacer</Fragment>,
  },
  {
    id: 8,
    name: "Table",
    icons: iconPim,
    component: () => <Fragment>Table</Fragment>,
  },
  {
    id: 9,
    name: "Attach",
    icons: iconPim,
    component: () => <Fragment>Attach</Fragment>,
  },
  {
    id: 10,
    name: "RSS",
    icons: iconPim,
    component: () => <Fragment>RSS</Fragment>,
  },
  {
    id: 11,
    name: "Image",
    icons: iconPim,
    component: () => <Fragment>Image</Fragment>,
  },
  {
    id: 12,
    name: "Video",
    icons: iconPim,
    component: () => <Fragment>Video</Fragment>,
  },
  {
    id: 13,
    name: "Social",
    icons: iconPim,
    component: () => <Fragment>Social</Fragment>,
  },
];
