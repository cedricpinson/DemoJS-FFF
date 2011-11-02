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

    // add new group
    var group = new osg.MatrixTransform();
    root.addChild(group);

    // add another node
    var item0 = new osg.MatrixTransform();
    item0.addChild(osg.createTexturedBox(0, 0, 0,
                                         10,10,10));
    item0.setMatrix(osg.Matrix.makeTranslate(15,0,0, []));
    group.addChild(item0);

    // change material
    var material = new osg.Material();
    material.setDiffuse([1.0, 0.0, 0.0, 1.0]);
    item0.getOrCreateStateSet().setAttributeAndMode(material);


    // add another node
    var item1 = new osg.MatrixTransform();
    item1.addChild(osg.createTexturedBox(0, 0, 0,
                                         10,10,10));
    item1.setMatrix(osg.Matrix.makeTranslate(15,15,0, []));
    group.addChild(item1);

    // change material
    var material = new osg.Material();
    material.setDiffuse([0.0, 0.0, 1.0, 1.0]);
    item1.getOrCreateStateSet().setAttributeAndMode(material);


    // now add a transform to the group
    group.setMatrix(osg.Matrix.makeTranslate(0,0,15, []));

    viewer.setupManipulator();
    viewer.run();
}