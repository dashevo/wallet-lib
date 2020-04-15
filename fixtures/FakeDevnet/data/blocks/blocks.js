const heights = {
  3798: '6736ee511514c2c644224a9c7dc380cdeb0cc1a35ad1718ffe419947a57df645',
  3799: '00000014a92cb29b478ea233a21bda2f28335237bb43186bb264d093cd5df0de',
  3800: '0000003a0ed27c5eb4721929170170f85e507531716173345d6954eb0de900fe',
  3801: '70d65c760880645a741af2bd9176998903c3dc9b2907a6bd35cd7a6171442917',
  3802: '104851b5d0b49e6d3780f42b278076f292f8d2a5aa807000fc051846597244f9',
  3803: '000001e691883ccd6cdb81f1f9d2c28ee02148c4995783c2d958c198d34be845',
  3804: '0000000483e69d37f3a07b40cc7e9bd40ab9c5d2119bd688f5c855942c83925f',
  3805: '000001d13389375c3aaf53d60c3a608d00cf37e38726adaea1047c1a1a6780b6',
  3806: '000001bef9c8bf377880b383ce54397d44a23c70545de59a1ac8bd6c6929bb1c',
  3807: '000001a67f840e035f41027feb1887673c098ca89955ce070e22bdba9ecbee6f',
  3808: '7b6139ea0a13db47ac6810ac4242a66b591daddc8e3ddd05a5e62f329cf44e07',
  3809: '00000112f2341beee4c82d46d4372329d812ed8e774dc2e3dbe37c73ec10a75e',
  3810: '75d76c2f9fff4e5b190c8966d1409b8461a0f3edf0dca65da80df9bbe41c5faa',
  3811: '000002191547ddd731a88c429b6f39be6da95de6c082c5a8f0e77f3c0a0e8b7c',
  3812: '000001a1bc6bc5051ba47e41751fe146ce465b780848a5d77d453761d21ce11c',
  21546: '00000261de92f250266fc09b501813d7a0c68a311cddc35c1799905342358fd8',
};

const hashes = {};
Object.keys(heights).map((height)=>{
  hashes[heights[height]] = height
});

module.exports = {
  heights, hashes,
};
