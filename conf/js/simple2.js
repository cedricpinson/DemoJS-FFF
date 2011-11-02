window.addEventListener("load", function() { start(); }, true );
function start(){
    var canvas = document.getElementById("3DView");
    canvas.width = 1280;
    canvas.height = 720;
    var viewer = new osgViewer.Viewer(canvas);
    viewer.init();

    // create a basic braph
    var root = new osg.Node();
    root.addChild(osg.createTexturedBox(0, 0, 0,
                                        10,10,10));
    viewer.setScene(root);

    // add another node
    var item0 = new osg.MatrixTransform();
    item0.addChild(osg.createTexturedBox(0, 0, 0,
                                         10,10,10));
    item0.setMatrix(osg.Matrix.makeTranslate(15,0,0, []));
    root.addChild(item0);

    // change material
    var material = new osg.Material();
    material.setDiffuse([1.0, 0.0, 0.0, 1.0]);
    item0.getOrCreateStateSet().setAttributeAndMode(material);

    viewer.setupManipulator();
    viewer.run();
}