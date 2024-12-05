describe('iD.serviceStreetview', function() {
    var dimensions = [64, 64];
    var context, streetview;

    before(function() {
        iD.services.streetview = iD.serviceStreetview;
        fetchMock.reset();
    });

    after(function() {
        delete iD.services.streetview;
    });

    beforeEach(function() {
        context = iD.coreContext().assetPath('../dist/').init();
        context.projection
            .scale(iD.geoZoomToScale(14))
            .translate([-116508, 0])  // 10,0
            .clipExtent([[0,0], dimensions]);

        streetview = iD.services.streetview;
        streetview.reset();
        fetchMock.reset();

        // never resolve
        fetchMock.mock(/api\.streetview\.xyz/, new Promise(() => {}));
    });

    afterEach(function() {
        fetchMock.reset();
    });


    describe('#init', function() {
        it('Initializes cache one time', function() {
            var cache = streetview.cache();
            expect(cache).to.have.property('images');
            expect(cache).to.have.property('sequences');

            streetview.init();
            var cache2 = streetview.cache();
            expect(cache).to.equal(cache2);
        });
    });

    describe('#reset', function() {
        it('resets cache and image', function() {
            streetview.cache().foo = 'bar';
            streetview.setActiveImage(context, {key: 'baz'});

            streetview.reset();
            expect(streetview.cache()).to.not.have.property('foo');
            expect(streetview.getActiveImage()).to.be.null;
        });
    });

    describe('#images', function() {
        it('returns images in the visible map area', function() {
            var features = [
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '0', loc: [10,0], heading: 90, sequence_id: '100', account_id: '0' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '1', loc: [10,0], heading: 90, sequence_id: '100', account_id: '1' } },
                { minX: 10, minY: 1, maxX: 10, maxY: 1, data: { id: '2', loc: [10,1], heading: 90, sequence_id: '100', account_id: '2' } }
            ];

            streetview.cache().images.rtree.load(features);
            var res = streetview.images(context.projection);

            expect(res).to.deep.eql([
                { id: '0', loc: [10,0], heading: 90, sequence_id: '100', account_id: '0' },
                { id: '1', loc: [10,0], heading: 90, sequence_id: '100', account_id: '1' }
            ]);
        });

        it('limits results no more than 5 stacked images in one spot', function() {
            var features = [
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '0', loc: [10,0], heading: 90, sequence_id: '100', account_id: '0' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '1', loc: [10,0], heading: 90, sequence_id: '100', account_id: '1' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '2', loc: [10,0], heading: 90, sequence_id: '100', account_id: '2' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '3', loc: [10,0], heading: 90, sequence_id: '100', account_id: '3' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '4', loc: [10,0], heading: 90, sequence_id: '100', account_id: '4' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '5', loc: [10,0], heading: 90, sequence_id: '100', account_id: '5' } }
            ];

            streetview.cache().images.rtree.load(features);
            var res = streetview.images(context.projection);
            expect(res).to.have.length.of.at.most(5);
        });
    });


    describe('#sequences', function() {
        it('returns sequence linestrings in the visible map area', function() {
            var features = [
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '0', loc: [10,0], heading: 90, sequence_id: '100', account_id: '0' } },
                { minX: 10, minY: 0, maxX: 10, maxY: 0, data: { id: '1', loc: [10,0], heading: 90, sequence_id: '100', account_id: '1' } },
                { minX: 10, minY: 1, maxX: 10, maxY: 1, data: { id: '2', loc: [10,1], heading: 90, sequence_id: '100', account_id: '2' } }
            ];

            streetview.cache().images.rtree.load(features);
            streetview.cache().sequences.lineString['100'] = { rotation: 0, images: [ features[0].data, features[1].data, features[2].data ] };

            var res = streetview.sequences(context.projection, 15);
            expect(res).to.deep.eql([{
                rotation: 0, images: [features[0].data, features[1].data, features[2].data]
            }]);
        });
    });

    describe('#selectedImage', function() {
        it('sets and gets selected image', function() {
            var d = { id: 'foo', sequence_id: '100'};
            streetview.cache().images = { forImageId: { foo: d }};
            streetview.selectImage(context, 'foo');
            expect(streetview.getActiveImage()).to.eql(d);
        });
    });

});
