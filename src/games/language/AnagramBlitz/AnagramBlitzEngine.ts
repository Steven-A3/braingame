import { GameEngine } from '@/games/core/GameEngine';
import type { GameConfig, GameCategory } from '@/games/core/types';

export interface AnagramBlitzState {
  letters: string[];
  foundWords: string[];
  possibleWords: string[];
  currentInput: string;
  timeRemaining: number;
  totalTime: number;
  feedback: 'valid' | 'invalid' | 'duplicate' | 'too-short' | null;
  lastWord: string;
  hintsUsed: number;
  maxHints: number;
  hint: string | null;
}

// Common 3-7 letter words for anagram generation
// Using a curated list that generates good anagram puzzles
const WORD_LIST = [
  // 3-letter words
  'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash', 'ask', 'ate',
  'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'bet', 'bid', 'big', 'bin', 'bit', 'bow', 'box', 'boy', 'bud', 'bug', 'bus', 'but', 'buy',
  'cab', 'can', 'cap', 'car', 'cat', 'cob', 'cod', 'cop', 'cot', 'cow', 'cry', 'cub', 'cup', 'cut',
  'dad', 'dam', 'day', 'den', 'dew', 'did', 'die', 'dig', 'dim', 'dip', 'dog', 'dot', 'dry', 'dub', 'dud', 'due', 'dug',
  'ear', 'eat', 'eel', 'egg', 'ego', 'elm', 'end', 'era', 'eve', 'eye',
  'fab', 'fad', 'fan', 'far', 'fat', 'fax', 'fed', 'fee', 'few', 'fig', 'fin', 'fir', 'fit', 'fix', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fun', 'fur',
  'gag', 'gap', 'gas', 'gel', 'gem', 'get', 'gin', 'gnu', 'god', 'got', 'gum', 'gun', 'gut', 'guy', 'gym',
  'had', 'ham', 'has', 'hat', 'hay', 'hem', 'hen', 'her', 'hid', 'him', 'hip', 'his', 'hit', 'hob', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'hum', 'hut',
  'ice', 'icy', 'ill', 'imp', 'ink', 'inn', 'ion', 'ire', 'irk', 'its', 'ivy',
  'jab', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jig', 'job', 'jog', 'jot', 'joy', 'jug', 'jut',
  'keg', 'ken', 'key', 'kid', 'kin', 'kit',
  'lab', 'lad', 'lag', 'lap', 'law', 'lay', 'lea', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low', 'lug',
  'mad', 'man', 'map', 'mar', 'mat', 'may', 'men', 'met', 'mid', 'mix', 'mob', 'mod', 'mom', 'mop', 'mow', 'mud', 'mug', 'mum',
  'nab', 'nag', 'nap', 'net', 'new', 'nip', 'nit', 'nod', 'nor', 'not', 'now', 'nub', 'nun', 'nut',
  'oak', 'oar', 'oat', 'odd', 'ode', 'off', 'oft', 'ohm', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our', 'out', 'owe', 'owl', 'own',
  'pad', 'pal', 'pan', 'par', 'pat', 'paw', 'pay', 'pea', 'peg', 'pen', 'pep', 'per', 'pet', 'pew', 'pie', 'pig', 'pin', 'pit', 'ply', 'pod', 'pop', 'pot', 'pro', 'pry', 'pub', 'pug', 'pun', 'pup', 'pus', 'put',
  'rag', 'ram', 'ran', 'rap', 'rat', 'raw', 'ray', 'red', 'ref', 'rep', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod', 'roe', 'rot', 'row', 'rub', 'rug', 'rum', 'run', 'rut', 'rye',
  'sac', 'sad', 'sag', 'sap', 'sat', 'saw', 'say', 'sea', 'set', 'sew', 'she', 'shy', 'sip', 'sir', 'sis', 'sit', 'six', 'ski', 'sky', 'sly', 'sob', 'sod', 'son', 'sop', 'sot', 'sow', 'soy', 'spa', 'spy', 'sty', 'sub', 'sue', 'sum', 'sun', 'sup',
  'tab', 'tad', 'tag', 'tan', 'tap', 'tar', 'tax', 'tea', 'ten', 'the', 'thy', 'tic', 'tie', 'tin', 'tip', 'toe', 'tog', 'ton', 'too', 'top', 'tot', 'tow', 'toy', 'try', 'tub', 'tug', 'two',
  'urn', 'use',
  'van', 'vat', 'vet', 'via', 'vie', 'vim', 'vow',
  'wad', 'wag', 'war', 'was', 'wax', 'way', 'web', 'wed', 'wee', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'woe', 'wok', 'won', 'woo', 'wow',
  'yak', 'yam', 'yap', 'yaw', 'yea', 'yen', 'yes', 'yet', 'yew', 'yin', 'you', 'yow',
  'zap', 'zed', 'zen', 'zip', 'zoo',
  // 4-letter words
  'able', 'ache', 'acid', 'acre', 'aged', 'aide', 'also', 'alto', 'amid', 'ants', 'apex', 'arch', 'area', 'arms', 'army', 'arts', 'atom', 'aunt', 'auto', 'avid', 'away', 'axis',
  'baby', 'back', 'bade', 'bags', 'bail', 'bait', 'bake', 'bald', 'bale', 'ball', 'balm', 'band', 'bane', 'bank', 'bare', 'bark', 'barn', 'bars', 'base', 'bash', 'bask', 'bass', 'bath', 'bats', 'bead', 'beak', 'beam', 'bean', 'bear', 'beat', 'beds', 'beef', 'been', 'beer', 'bees', 'bell', 'belt', 'bend', 'bent', 'best', 'beta', 'bias', 'bids', 'bike', 'bile', 'bill', 'bind', 'bird', 'bite', 'bits', 'blow', 'blue', 'blur', 'boat', 'body', 'boil', 'bold', 'bolt', 'bomb', 'bond', 'bone', 'book', 'boom', 'boot', 'bore', 'born', 'boss', 'both', 'bout', 'bowl', 'boys', 'brag', 'bran', 'bred', 'brew', 'brim', 'bulk', 'bull', 'bump', 'bunk', 'burn', 'bury', 'bush', 'bust', 'busy', 'butt', 'byte',
  'cafe', 'cage', 'cake', 'calf', 'call', 'calm', 'came', 'camp', 'cane', 'cape', 'caps', 'card', 'care', 'carp', 'cars', 'cart', 'case', 'cash', 'cask', 'cast', 'cats', 'cave', 'cell', 'char', 'chat', 'chef', 'chin', 'chip', 'chop', 'cite', 'city', 'clad', 'clam', 'clan', 'clap', 'claw', 'clay', 'clip', 'club', 'clue', 'coal', 'coat', 'code', 'coil', 'coin', 'cold', 'come', 'cone', 'cook', 'cool', 'cope', 'copy', 'cord', 'core', 'cork', 'corn', 'cost', 'coup', 'crab', 'crew', 'crib', 'crop', 'crow', 'cube', 'cups', 'curb', 'cure', 'curl',
  'dame', 'damp', 'dare', 'dark', 'dart', 'dash', 'data', 'date', 'dawn', 'days', 'dead', 'deaf', 'deal', 'dean', 'dear', 'debt', 'deck', 'deed', 'deem', 'deep', 'deer', 'demo', 'dent', 'deny', 'desk', 'dial', 'dice', 'died', 'diet', 'dime', 'dine', 'dire', 'dirt', 'disc', 'dish', 'disk', 'dive', 'dock', 'does', 'dogs', 'doll', 'dome', 'done', 'doom', 'door', 'dose', 'dots', 'dote', 'down', 'doze', 'drag', 'dram', 'draw', 'drew', 'drip', 'drop', 'drum', 'dual', 'duck', 'dude', 'duel', 'duet', 'duke', 'dull', 'dumb', 'dump', 'dune', 'dunk', 'dusk', 'dust', 'duty',
  'each', 'ears', 'ease', 'east', 'easy', 'eats', 'echo', 'edge', 'edit', 'eels', 'eggs', 'else', 'emit', 'ends', 'envy', 'epic', 'even', 'ever', 'evil', 'exam', 'exit', 'eyed', 'eyes',
  'face', 'fact', 'fade', 'fail', 'fair', 'fake', 'fall', 'fame', 'fans', 'fare', 'farm', 'fast', 'fate', 'fawn', 'fear', 'feat', 'feed', 'feel', 'fees', 'feet', 'fell', 'felt', 'fend', 'fern', 'fest', 'feud', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'fist', 'fits', 'five', 'flag', 'flak', 'flap', 'flat', 'flaw', 'flax', 'flea', 'fled', 'flew', 'flip', 'flit', 'flog', 'flow', 'foam', 'foes', 'fold', 'folk', 'fond', 'font', 'food', 'fool', 'foot', 'fore', 'fork', 'form', 'fort', 'foul', 'four', 'fowl', 'free', 'frog', 'from', 'fuel', 'full', 'fume', 'fund', 'furs', 'fury', 'fuse', 'fuss',
  'gain', 'gale', 'game', 'gang', 'gaps', 'garb', 'gas', 'gate', 'gave', 'gaze', 'gear', 'gems', 'gene', 'gets', 'gift', 'gild', 'gill', 'gilt', 'gird', 'girl', 'gist', 'give', 'glad', 'glee', 'glen', 'glow', 'glue', 'glum', 'glut', 'gnat', 'gnaw', 'goal', 'goat', 'gods', 'goes', 'gold', 'golf', 'gone', 'good', 'gore', 'gown', 'grab', 'gram', 'gray', 'grew', 'grey', 'grid', 'grim', 'grin', 'grip', 'grit', 'grow', 'grub', 'gulf', 'gulp', 'gums', 'gunk', 'guns', 'gust', 'guts', 'guys',
  'hack', 'hail', 'hair', 'half', 'hall', 'halt', 'hand', 'hang', 'hank', 'hard', 'hare', 'harm', 'harp', 'hash', 'hasp', 'hast', 'hate', 'haul', 'have', 'hawk', 'haze', 'hazy', 'head', 'heal', 'heap', 'hear', 'heat', 'heck', 'heed', 'heel', 'held', 'hell', 'helm', 'help', 'hemp', 'hens', 'herb', 'herd', 'here', 'hero', 'hers', 'hick', 'hide', 'high', 'hike', 'hill', 'hilt', 'hind', 'hint', 'hips', 'hire', 'hiss', 'hits', 'hive', 'hoax', 'hobs', 'hock', 'hoed', 'hoes', 'hogs', 'hold', 'hole', 'holy', 'home', 'hood', 'hoof', 'hook', 'hoop', 'hope', 'hops', 'horn', 'hose', 'host', 'hour', 'howl', 'hubs', 'hued', 'hues', 'huge', 'hugs', 'hull', 'hump', 'hums', 'hung', 'hunk', 'hunt', 'hurl', 'hurt', 'hush', 'hymn',
  'iced', 'ices', 'icon', 'idea', 'idle', 'idol', 'inch', 'info', 'into', 'ions', 'iris', 'iron', 'isle', 'itch', 'item',
  'jabs', 'jack', 'jade', 'jail', 'jams', 'jars', 'java', 'jaws', 'jazz', 'jean', 'jeer', 'jerk', 'jest', 'jets', 'jobs', 'jock', 'jogs', 'join', 'joke', 'jolt', 'jots', 'joys', 'judo', 'jugs', 'jump', 'June', 'junk', 'jury', 'just', 'juts',
  'keel', 'keen', 'keep', 'kegs', 'kelp', 'kept', 'keys', 'kick', 'kids', 'kill', 'kiln', 'kilt', 'kind', 'king', 'kiss', 'kite', 'kits', 'knee', 'knew', 'knit', 'knob', 'knot', 'know',
  'labs', 'lace', 'lack', 'lacy', 'lads', 'lady', 'lags', 'laid', 'lain', 'lair', 'lake', 'lamb', 'lame', 'lamp', 'land', 'lane', 'laps', 'lard', 'lark', 'lash', 'lass', 'last', 'late', 'laud', 'lawn', 'laws', 'lays', 'lazy', 'lead', 'leaf', 'leak', 'lean', 'leap', 'left', 'legs', 'lend', 'lens', 'lent', 'less', 'lest', 'levy', 'liar', 'lice', 'lick', 'lids', 'lied', 'lien', 'lies', 'life', 'lift', 'like', 'limb', 'lime', 'limp', 'line', 'link', 'lint', 'lion', 'lips', 'list', 'live', 'load', 'loaf', 'loam', 'loan', 'lobe', 'lock', 'lode', 'loft', 'logo', 'logs', 'lone', 'long', 'look', 'loom', 'loop', 'loot', 'lord', 'lore', 'lose', 'loss', 'lost', 'lots', 'loud', 'love', 'luck', 'lull', 'lump', 'lung', 'lure', 'lurk', 'lush', 'lust',
  'made', 'maid', 'mail', 'main', 'make', 'male', 'mall', 'malt', 'mane', 'many', 'maps', 'mare', 'mark', 'mars', 'mart', 'mash', 'mask', 'mass', 'mast', 'mate', 'math', 'mats', 'maze', 'mead', 'meal', 'mean', 'meat', 'meek', 'meet', 'meld', 'melt', 'memo', 'mend', 'menu', 'mere', 'mesh', 'mess', 'mild', 'mile', 'milk', 'mill', 'mind', 'mine', 'mint', 'mire', 'miss', 'mist', 'mite', 'mitt', 'moan', 'moat', 'mock', 'mode', 'mold', 'mole', 'molt', 'monk', 'mood', 'moon', 'moor', 'moot', 'mope', 'more', 'morn', 'moss', 'most', 'moth', 'move', 'much', 'muck', 'muds', 'mugs', 'mule', 'mull', 'murk', 'muse', 'mush', 'musk', 'must', 'mute', 'mutt',
  'nail', 'name', 'nape', 'naps', 'navy', 'near', 'neat', 'neck', 'need', 'nest', 'nets', 'news', 'newt', 'next', 'nice', 'nick', 'nine', 'nips', 'node', 'nods', 'none', 'nook', 'noon', 'nope', 'norm', 'nose', 'note', 'noun', 'numb', 'nuns', 'nuts',
  'oaks', 'oars', 'oath', 'oats', 'obey', 'odds', 'odes', 'oils', 'oily', 'okay', 'omen', 'omit', 'once', 'ones', 'only', 'onto', 'ooze', 'opal', 'open', 'opts', 'oral', 'orbs', 'orca', 'ores', 'ours', 'oust', 'outs', 'oval', 'oven', 'over', 'owed', 'owes', 'owls', 'owns',
  'pace', 'pack', 'pact', 'pads', 'page', 'paid', 'pail', 'pain', 'pair', 'pale', 'palm', 'pals', 'pane', 'pans', 'pant', 'park', 'part', 'pass', 'past', 'path', 'pats', 'pave', 'pawn', 'paws', 'pays', 'peak', 'peal', 'pear', 'peas', 'peat', 'peck', 'peek', 'peel', 'peer', 'pegs', 'pelt', 'pens', 'peon', 'perk', 'perm', 'pest', 'pets', 'pews', 'pick', 'pier', 'pies', 'pigs', 'pike', 'pile', 'pill', 'pine', 'pink', 'pins', 'pint', 'pipe', 'pips', 'pits', 'pity', 'plan', 'play', 'plea', 'pled', 'plod', 'plop', 'plot', 'plow', 'ploy', 'plug', 'plum', 'plus', 'pock', 'pods', 'poem', 'poet', 'poke', 'pole', 'poll', 'polo', 'pomp', 'pond', 'pony', 'pool', 'poor', 'pope', 'pops', 'pore', 'pork', 'port', 'pose', 'post', 'pots', 'pour', 'pout', 'pray', 'prep', 'prey', 'prim', 'prod', 'prop', 'pros', 'prow', 'pubs', 'puck', 'puds', 'puff', 'pugs', 'pull', 'pulp', 'pump', 'punk', 'puns', 'pups', 'pure', 'push', 'puts', 'putt',
  'quad', 'quay', 'quid', 'quit', 'quiz',
  'race', 'rack', 'raft', 'rage', 'rags', 'raid', 'rail', 'rain', 'rake', 'ramp', 'rams', 'rang', 'rank', 'rant', 'rape', 'raps', 'rapt', 'rare', 'rash', 'rasp', 'rate', 'rats', 'rave', 'rays', 'raze', 'razz', 'read', 'real', 'ream', 'reap', 'rear', 'redo', 'reds', 'reed', 'reef', 'reek', 'reel', 'refs', 'rein', 'rely', 'rend', 'rent', 'reps', 'rest', 'ribs', 'rice', 'rich', 'ride', 'rids', 'rife', 'rift', 'rigs', 'rile', 'rill', 'rims', 'rind', 'ring', 'rink', 'riot', 'ripe', 'rips', 'rise', 'risk', 'rite', 'road', 'roam', 'roar', 'robe', 'robs', 'rock', 'rode', 'rods', 'role', 'roll', 'romp', 'roof', 'room', 'root', 'rope', 'ropy', 'rose', 'rosy', 'rote', 'rots', 'rout', 'rows', 'rubs', 'ruby', 'ruck', 'rude', 'rued', 'rues', 'rugs', 'ruin', 'rule', 'rump', 'rums', 'rune', 'rung', 'runs', 'runt', 'ruse', 'rush', 'rust', 'ruts',
  'sack', 'safe', 'saga', 'sage', 'sags', 'said', 'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank', 'saps', 'sari', 'sash', 'save', 'sawn', 'saws', 'says', 'scab', 'scam', 'scan', 'scar', 'seal', 'seam', 'sear', 'seas', 'seat', 'sect', 'seed', 'seek', 'seem', 'seen', 'seep', 'seer', 'sees', 'self', 'sell', 'send', 'sent', 'sept', 'sere', 'serf', 'sets', 'sewn', 'sews', 'shag', 'sham', 'shaw', 'shed', 'shim', 'shin', 'ship', 'shiv', 'shmo', 'shod', 'shoe', 'shoo', 'shop', 'shot', 'show', 'shul', 'shun', 'shut', 'sick', 'side', 'sift', 'sigh', 'sign', 'silk', 'sill', 'silo', 'silt', 'sine', 'sing', 'sink', 'sins', 'sips', 'sire', 'site', 'sits', 'size', 'skew', 'skid', 'skim', 'skin', 'skip', 'skit', 'slab', 'slag', 'slam', 'slap', 'slat', 'slaw', 'slay', 'sled', 'slew', 'slid', 'slim', 'slip', 'slit', 'slob', 'sloe', 'slog', 'slop', 'slot', 'slow', 'slue', 'slug', 'slum', 'slur', 'smog', 'snag', 'snap', 'snare', 'snit', 'snob', 'snot', 'snow', 'snub', 'snug', 'soak', 'soap', 'soar', 'sobs', 'sock', 'soda', 'sods', 'sofa', 'soft', 'soil', 'sold', 'sole', 'solo', 'some', 'song', 'sons', 'soon', 'soot', 'sops', 'sore', 'sort', 'sots', 'soul', 'soup', 'sour', 'sown', 'sows', 'span', 'spar', 'spas', 'spat', 'spec', 'sped', 'spew', 'spin', 'spit', 'spot', 'spry', 'spud', 'spun', 'spur', 'stab', 'stag', 'star', 'stay', 'stem', 'step', 'stew', 'stir', 'stop', 'stow', 'stub', 'stud', 'stun', 'subs', 'such', 'suck', 'suds', 'sued', 'sues', 'suit', 'sulk', 'sums', 'sung', 'sunk', 'suns', 'sure', 'surf', 'swab', 'swam', 'swan', 'swap', 'swat', 'sway', 'swim', 'swum',
  'tabs', 'tack', 'tact', 'tags', 'tail', 'take', 'tale', 'talk', 'tall', 'tame', 'tamp', 'tang', 'tank', 'tans', 'tape', 'taps', 'tare', 'tarn', 'tarp', 'tars', 'tart', 'task', 'taxa', 'taxi', 'teak', 'teal', 'team', 'tear', 'teas', 'teed', 'teem', 'teen', 'tees', 'tell', 'temp', 'tend', 'tens', 'tent', 'term', 'tern', 'test', 'text', 'than', 'that', 'thaw', 'them', 'then', 'they', 'thin', 'this', 'thud', 'thug', 'thus', 'tick', 'tide', 'tidy', 'tied', 'tier', 'ties', 'tiff', 'tile', 'till', 'tilt', 'time', 'tine', 'tins', 'tint', 'tiny', 'tips', 'tire', 'toad', 'tock', 'toes', 'togs', 'toil', 'told', 'toll', 'tomb', 'tome', 'tone', 'tons', 'took', 'tool', 'toot', 'tops', 'tore', 'torn', 'tort', 'toss', 'tots', 'tour', 'tout', 'town', 'tows', 'toys', 'tram', 'trap', 'tray', 'tree', 'trek', 'trim', 'trio', 'trip', 'trod', 'trot', 'true', 'tsar', 'tuba', 'tube', 'tubs', 'tuck', 'tuft', 'tugs', 'tuna', 'tune', 'turf', 'turn', 'tusk', 'tutu', 'twig', 'twin', 'twit', 'twos', 'type',
  'ugly', 'undo', 'unit', 'unto', 'upon', 'urge', 'urns', 'used', 'user', 'uses',
  'vain', 'vale', 'vane', 'vans', 'vary', 'vase', 'vast', 'vats', 'veal', 'veer', 'veil', 'vein', 'vent', 'verb', 'very', 'vest', 'veto', 'vets', 'vial', 'vibe', 'vice', 'vied', 'vies', 'view', 'vile', 'vine', 'visa', 'vise', 'void', 'volt', 'vote', 'vows',
  'wade', 'wads', 'waft', 'wage', 'wags', 'waif', 'wail', 'wait', 'wake', 'walk', 'wall', 'wand', 'wane', 'want', 'ward', 'warm', 'warn', 'warp', 'wars', 'wart', 'wary', 'wash', 'wasp', 'wave', 'wavy', 'waxy', 'ways', 'weak', 'wean', 'wear', 'webs', 'weds', 'weed', 'week', 'weep', 'weld', 'well', 'welt', 'went', 'wept', 'were', 'west', 'wets', 'wham', 'what', 'whim', 'whip', 'whir', 'whom', 'wick', 'wide', 'wife', 'wigs', 'wild', 'will', 'wilt', 'wimp', 'wind', 'wine', 'wing', 'wink', 'wins', 'wipe', 'wire', 'wiry', 'wise', 'wish', 'wisp', 'with', 'wits', 'woke', 'woks', 'wolf', 'womb', 'wont', 'wood', 'woof', 'wool', 'word', 'wore', 'work', 'worm', 'worn', 'wort', 'wove', 'wrap', 'writ',
  'yaks', 'yams', 'yank', 'yaps', 'yard', 'yarn', 'yawl', 'yawn', 'yaws', 'yeah', 'year', 'yeas', 'yell', 'yens', 'yeps', 'yerk', 'yews', 'yids', 'yike', 'yill', 'yins', 'yipe', 'ylem', 'yobs', 'yock', 'yods', 'yoga', 'yogh', 'yogi', 'yoke', 'yolk', 'yore', 'your', 'yowl', 'yows', 'yuan', 'yuca', 'yuch', 'yuck', 'yuks',
  'zaps', 'zeal', 'zero', 'zest', 'zinc', 'zips', 'zone', 'zoom', 'zoos',
  // 5-letter words
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'align', 'alike', 'alive', 'allow', 'alone', 'along', 'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armor', 'array', 'aside', 'asset', 'avoid', 'awake', 'award', 'aware',
  'basic', 'basis', 'beach', 'beast', 'began', 'begin', 'being', 'below', 'bench', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'blend', 'bless', 'blind', 'block', 'blood', 'bloom', 'blown', 'board', 'boast', 'bonus', 'boost', 'booth', 'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'broad', 'brown', 'brush', 'build', 'built', 'bunch', 'burst', 'buyer',
  'cable', 'camel', 'carry', 'carve', 'catch', 'cause', 'cease', 'chain', 'chair', 'champ', 'charm', 'chart', 'chase', 'cheap', 'check', 'chess', 'chest', 'chief', 'child', 'china', 'choir', 'chose', 'civil', 'claim', 'class', 'clean', 'clear', 'clerk', 'click', 'cliff', 'climb', 'cling', 'clock', 'close', 'cloth', 'cloud', 'coach', 'coast', 'color', 'couch', 'could', 'count', 'court', 'cover', 'crack', 'craft', 'crane', 'crash', 'crawl', 'crazy', 'cream', 'creek', 'creep', 'crime', 'crisp', 'cross', 'crowd', 'crown', 'crude', 'cruel', 'crush', 'curve',
  'daily', 'dairy', 'dance', 'datum', 'dealt', 'death', 'debut', 'decay', 'delay', 'demon', 'dense', 'depth', 'devil', 'diary', 'dirty', 'doubt', 'dozen', 'draft', 'drain', 'drama', 'drank', 'drawn', 'dream', 'dress', 'dried', 'drill', 'drink', 'drive', 'drown', 'drunk', 'dusty', 'dwarf', 'dwell',
  'eager', 'eagle', 'early', 'earth', 'eaten', 'eight', 'elder', 'elect', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'equip', 'error', 'essay', 'event', 'every', 'exact', 'exert', 'exist', 'extra',
  'faint', 'faith', 'false', 'fancy', 'fatal', 'fault', 'feast', 'fence', 'fetch', 'fever', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed', 'flame', 'flash', 'flesh', 'float', 'flock', 'flood', 'floor', 'flora', 'flour', 'flown', 'fluid', 'flush', 'focus', 'force', 'forge', 'forth', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'fried', 'front', 'frost', 'fruit', 'fully',
  'giant', 'given', 'glade', 'glare', 'glass', 'gleam', 'glide', 'globe', 'gloom', 'glory', 'glove', 'graft', 'grain', 'grand', 'grant', 'grape', 'grasp', 'grass', 'grave', 'graze', 'great', 'green', 'greet', 'grief', 'grill', 'grind', 'groan', 'groom', 'grope', 'gross', 'group', 'grove', 'growl', 'grown', 'guard', 'guess', 'guest', 'guide', 'guild', 'guilt',
  'habit', 'handy', 'happy', 'harsh', 'haste', 'hasty', 'hatch', 'haunt', 'haven', 'heart', 'heath', 'heavy', 'hedge', 'heist', 'hello', 'hence', 'hinge', 'hobby', 'honey', 'honor', 'horse', 'hotel', 'hound', 'house', 'hover', 'human', 'humor', 'hurry',
  'ideal', 'image', 'imply', 'index', 'inner', 'input', 'issue',
  'jelly', 'jewel', 'joint', 'joker', 'jolly', 'juice', 'juicy', 'jumbo', 'jumpy',
  'knife', 'knock', 'known',
  'label', 'labor', 'lance', 'large', 'laser', 'latch', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lever', 'light', 'limit', 'linen', 'liver', 'local', 'lodge', 'logic', 'loose', 'lorry', 'loser', 'lover', 'lower', 'loyal', 'lucky', 'lunch', 'lunge',
  'magic', 'major', 'maker', 'march', 'marry', 'marsh', 'mason', 'match', 'mayor', 'medal', 'media', 'mercy', 'merge', 'merit', 'merry', 'metal', 'meter', 'midst', 'might', 'minor', 'minus', 'mirth', 'mixed', 'model', 'moist', 'money', 'month', 'moral', 'motor', 'mount', 'mourn', 'mouse', 'mouth', 'movie', 'muddy', 'music', 'musty',
  'naked', 'nasty', 'naval', 'nerve', 'never', 'newly', 'night', 'ninth', 'noble', 'noise', 'noisy', 'north', 'notch', 'noted', 'novel', 'nurse',
  'occur', 'ocean', 'offer', 'often', 'olive', 'onset', 'opera', 'orbit', 'order', 'organ', 'other', 'ought', 'ounce', 'outer', 'owned', 'owner', 'oxide',
  'paint', 'panel', 'panic', 'paper', 'party', 'paste', 'patch', 'pause', 'peace', 'peach', 'pearl', 'penny', 'phase', 'phone', 'photo', 'piano', 'piece', 'pilot', 'pinch', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate', 'plaza', 'plead', 'pleat', 'pluck', 'plumb', 'plump', 'plunge', 'poach', 'point', 'polar', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior', 'prize', 'probe', 'prone', 'proof', 'prose', 'proud', 'prove', 'punch',
  'quake', 'qualm', 'queen', 'query', 'quest', 'quick', 'quiet', 'quilt', 'quirk', 'quota', 'quote',
  'radar', 'radio', 'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio', 'reach', 'react', 'realm', 'rebel', 'refer', 'reign', 'relax', 'reply', 'right', 'rigid', 'ripen', 'risen', 'risky', 'rival', 'river', 'roast', 'robot', 'rocky', 'rouge', 'rough', 'round', 'route', 'royal', 'rugby', 'ruler', 'rumor', 'rural',
  'saint', 'salad', 'sales', 'salty', 'sandy', 'sauce', 'scale', 'scare', 'scarf', 'scary', 'scene', 'scent', 'scope', 'score', 'scout', 'scrap', 'seize', 'sense', 'serve', 'setup', 'seven', 'shade', 'shaft', 'shake', 'shall', 'shame', 'shape', 'share', 'shark', 'sharp', 'shave', 'sheep', 'sheer', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shiny', 'shirt', 'shock', 'shore', 'short', 'shout', 'shown', 'shrug', 'sight', 'sigma', 'silly', 'since', 'sixth', 'sixty', 'skate', 'skill', 'skull', 'slate', 'slave', 'sleep', 'slice', 'slide', 'sling', 'slope', 'small', 'smart', 'smash', 'smell', 'smile', 'smoke', 'smoky', 'snake', 'snare', 'sneak', 'snowflake', 'snowy', 'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'spark', 'spawn', 'speak', 'spear', 'speed', 'spell', 'spend', 'spent', 'spice', 'spicy', 'spill', 'spine', 'spite', 'splat', 'split', 'spoon', 'sport', 'spray', 'spurt', 'squad', 'stack', 'staff', 'stage', 'stain', 'stair', 'stake', 'stale', 'stamp', 'stand', 'stare', 'stark', 'start', 'state', 'stave', 'stays', 'steady', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer', 'stern', 'stick', 'stiff', 'still', 'sting', 'stink', 'stock', 'stomp', 'stone', 'stool', 'stoop', 'store', 'storm', 'story', 'stout', 'stove', 'strap', 'straw', 'stray', 'strip', 'stuck', 'study', 'stuff', 'stump', 'stung', 'stunk', 'style', 'sugar', 'suite', 'sunny', 'super', 'surge', 'swamp', 'swarm', 'swear', 'sweat', 'sweep', 'sweet', 'swell', 'swept', 'swift', 'swing', 'sword', 'sworn',
  'table', 'taken', 'taste', 'tasty', 'teach', 'teeth', 'tempo', 'tense', 'tenth', 'terms', 'thank', 'theft', 'their', 'theme', 'there', 'these', 'thick', 'thief', 'thigh', 'thing', 'think', 'third', 'thorn', 'those', 'three', 'threw', 'throw', 'thumb', 'tiger', 'tight', 'timer', 'title', 'toast', 'today', 'token', 'topic', 'torch', 'total', 'touch', 'tough', 'towel', 'tower', 'trace', 'track', 'trade', 'trail', 'train', 'trait', 'trash', 'trawl', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried', 'troop', 'trout', 'truck', 'truly', 'trump', 'trunk', 'trust', 'truth', 'tumor', 'tunic', 'twice', 'twist',
  'ultra', 'uncle', 'under', 'undue', 'unfold', 'union', 'unite', 'unity', 'until', 'upper', 'upset', 'urban', 'usual',
  'vague', 'valid', 'value', 'vapor', 'vault', 'venue', 'verge', 'verse', 'video', 'vigor', 'viral', 'virus', 'visit', 'vista', 'vital', 'vivid', 'vocal', 'vogue', 'voice', 'voter',
  'wager', 'wagon', 'waist', 'waste', 'watch', 'water', 'weary', 'weave', 'wedge', 'weeds', 'weird', 'whale', 'wheat', 'wheel', 'where', 'which', 'while', 'whine', 'whirl', 'white', 'whole', 'whose', 'widen', 'widow', 'width', 'wield', 'windy', 'witch', 'woman', 'woods', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'wrath', 'wreck', 'wring', 'write', 'wrong', 'wrote',
  'yacht', 'yearn', 'yeast', 'yield', 'young', 'youth',
  'zesty',
];

// Create a Set for fast lookup
const VALID_WORDS = new Set(WORD_LIST.map(w => w.toLowerCase()));

// Seed words that generate good anagram puzzles (6-8 letters)
const SEED_WORDS = [
  'STRANGE', 'RESTING', 'STRANGE', 'PLAYERS', 'MASTER', 'STREAM', 'TRADES', 'LISTEN', 'SILENT',
  'GARDEN', 'DANGER', 'ANGER', 'RANGE', 'GANDER', 'GRANDS', 'DRAINS', 'STRAND',
  'HEARTS', 'HATERS', 'SHATTER', 'EARTHS', 'STREAM', 'MASTER', 'TAMERS',
  'PLATES', 'STAPLE', 'PETALS', 'PLEATS', 'PASTEL', 'PALEST',
  'CARETS', 'CRATES', 'TRACES', 'REACTS', 'CASTER',
  'NOTES', 'TONES', 'STONE', 'ONSET', 'STENO',
  'SPARE', 'SPEAR', 'PARSE', 'PEARS', 'REAPS', 'PARES',
  'LUSTER', 'RUSTLE', 'RESULT', 'SUTLER', 'ULSTER',
  'SKATER', 'STREAK', 'STAKES', 'STEAKS', 'TASKER',
  'TRAINER', 'RETRAIN', 'TERRAIN', 'STRAINER',
];

export class AnagramBlitzEngine extends GameEngine {
  readonly category: GameCategory = 'language';
  readonly maxLevels = 10;

  private gameState: AnagramBlitzState = {
    letters: [],
    foundWords: [],
    possibleWords: [],
    currentInput: '',
    timeRemaining: 60,
    totalTime: 60,
    feedback: null,
    lastWord: '',
    hintsUsed: 0,
    maxHints: 3,
    hint: null,
  };

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: GameConfig) {
    super(config);
  }

  async init(): Promise<void> {
    this.state.status = 'ready';
    this.notifyStateChange();
  }

  private getTimeForLevel(level: number): number {
    // Less time as levels progress (90s → 45s)
    return Math.max(90 - (level - 1) * 5, 45);
  }

  private getMinLettersForLevel(level: number): number {
    // More letters as levels progress (6 → 8)
    return Math.min(6 + Math.floor(level / 4), 8);
  }

  generateLevel(): void {
    const totalTime = this.getTimeForLevel(this.state.level);
    const minLetters = this.getMinLettersForLevel(this.state.level);

    // Pick a seed word
    const seedWord = SEED_WORDS[this.rng.nextInt(0, SEED_WORDS.length - 1)];
    const letters = this.rng.shuffle(seedWord.split(''));

    // Add extra letters for higher levels
    const extraLetters = minLetters - letters.length;
    if (extraLetters > 0) {
      const vowels = ['A', 'E', 'I', 'O', 'U'];
      const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W'];
      for (let i = 0; i < extraLetters; i++) {
        const pool = i % 2 === 0 ? vowels : consonants;
        letters.push(pool[this.rng.nextInt(0, pool.length - 1)]);
      }
    }

    // Find all possible words from these letters
    const possibleWords = this.findPossibleWords(letters);

    this.gameState = {
      letters: this.rng.shuffle(letters),
      foundWords: [],
      possibleWords,
      currentInput: '',
      timeRemaining: totalTime,
      totalTime,
      feedback: null,
      lastWord: '',
      hintsUsed: 0,
      maxHints: 3,
      hint: null,
    };

    this.notifyStateChange();
    this.startTimer();
  }

  private findPossibleWords(letters: string[]): string[] {
    const letterCounts = this.getLetterCounts(letters.map(l => l.toLowerCase()));
    const possible: string[] = [];

    for (const word of VALID_WORDS) {
      if (word.length >= 3 && this.canMakeWord(word, letterCounts)) {
        possible.push(word);
      }
    }

    return possible.sort((a, b) => b.length - a.length);
  }

  private getLetterCounts(letters: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const letter of letters) {
      counts.set(letter, (counts.get(letter) || 0) + 1);
    }
    return counts;
  }

  private canMakeWord(word: string, availableLetters: Map<string, number>): boolean {
    const wordCounts = this.getLetterCounts(word.split(''));

    for (const [letter, count] of wordCounts) {
      if ((availableLetters.get(letter) || 0) < count) {
        return false;
      }
    }
    return true;
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      if (this.state.status !== 'playing') return;

      this.gameState.timeRemaining--;
      this.notifyStateChange();

      if (this.gameState.timeRemaining <= 0) {
        this.endRound();
      }
    }, 1000);
  }

  private endRound(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Check if passed level (need to find at least 30% of possible words with 3+ chars)
    const targetWords = Math.max(3, Math.floor(this.gameState.possibleWords.length * 0.2));
    const passed = this.gameState.foundWords.length >= targetWords;

    if (passed) {
      // Bonus for finding more words
      const bonusPerWord = 20;
      const bonus = Math.max(0, this.gameState.foundWords.length - targetWords) * bonusPerWord;
      this.levelComplete(bonus);
    } else {
      this.gameComplete('lose');
    }
  }

  handleInput(input: { type: 'letter' | 'backspace' | 'submit' | 'shuffle' | 'hint'; letter?: string }): void {
    if (this.state.status !== 'playing') return;

    // Clear any previous feedback
    this.gameState.feedback = null;
    this.gameState.hint = null;

    switch (input.type) {
      case 'letter':
        if (input.letter && this.gameState.currentInput.length < this.gameState.letters.length) {
          this.gameState.currentInput += input.letter.toLowerCase();
        }
        break;

      case 'backspace':
        this.gameState.currentInput = this.gameState.currentInput.slice(0, -1);
        break;

      case 'submit':
        this.submitWord();
        break;

      case 'shuffle':
        this.gameState.letters = this.rng.shuffle([...this.gameState.letters]);
        break;

      case 'hint':
        this.useHint();
        break;
    }

    this.notifyStateChange();
  }

  private submitWord(): void {
    const word = this.gameState.currentInput.toLowerCase();
    this.gameState.currentInput = '';

    if (word.length < 3) {
      this.gameState.feedback = 'too-short';
      return;
    }

    if (this.gameState.foundWords.includes(word)) {
      this.gameState.feedback = 'duplicate';
      this.gameState.lastWord = word;
      return;
    }

    if (!this.gameState.possibleWords.includes(word)) {
      this.gameState.feedback = 'invalid';
      this.gameState.lastWord = word;
      return;
    }

    // Valid word!
    this.gameState.foundWords.push(word);
    this.gameState.feedback = 'valid';
    this.gameState.lastWord = word;

    // Score based on word length
    const points = this.calculateWordScore(word);
    this.correct(points);
  }

  private calculateWordScore(word: string): number {
    // Exponential scoring for longer words
    const lengthBonus = [0, 0, 0, 10, 20, 40, 80, 120, 180, 250];
    return lengthBonus[Math.min(word.length, lengthBonus.length - 1)] || 250;
  }

  private useHint(): void {
    if (this.gameState.hintsUsed >= this.gameState.maxHints) return;

    // Find a word not yet found
    const unfound = this.gameState.possibleWords.filter(
      w => !this.gameState.foundWords.includes(w) && w.length >= 4
    );

    if (unfound.length === 0) return;

    // Pick a random unfound word and show first few letters
    const hintWord = unfound[this.rng.nextInt(0, unfound.length - 1)];
    const revealCount = Math.min(3, hintWord.length - 1);
    this.gameState.hint = hintWord.slice(0, revealCount) + '_'.repeat(hintWord.length - revealCount);
    this.gameState.hintsUsed++;

    // Small score penalty for hint
    this.state.score = Math.max(0, this.state.score - 20);
  }

  getGameState(): AnagramBlitzState {
    return { ...this.gameState };
  }

  cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
