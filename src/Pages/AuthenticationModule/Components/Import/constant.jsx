export const iframeStyles = `<style>
html {
  height: auto !important;
  overflow: hidden !important;
}
body {
  margin: 0;
  height: auto !important;
  overflow: hidden !important;
}
.nav-tabs{
list-style:none;
display: flex;
padding-left: 10px;
cursor: pointer;
align-items: center;
justify-content: center;
}
.tab-active{
border:1px dotted blue;
position: relative;
background-color: blue !important;
color: white !important;
}
.tab-active::before {
  content: '';
  position: absolute;
  top: 100%; 
  left: 50%;
  margin-left: -10px;
  width: 0;
  height: 0;
  border-top: 10px solid #005bf6;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}
.nav-tabs li {
    padding: 8px 12px;
    margin-right:1px;
    border: 1px solid blue;
    background-color: white;
}
.active {
 display: block !important;
}
.tab-pane {
 display: none;
}
a, input, button {
 pointer-events: none !important;
}
</style>`;
