var _notes = new Array();
var _guessNote;
var _msForLvlMsg=2000; //3000;
var _msPerAni=35;
var _pxPerAni;
var _lastNoteTimeMs=0;
var _timer=null;
var _levelTimer=null;
var _totalPixels=0;
var _correctNoteCt=0;
var _totCorrectNoteCt=0;
var _totIncorrectNoteCt=0;
var _displayedNoteCounter=0;

var _minGameWidth=400;
var _maxGameWidth=500;
var _gameWidth=500;
var _noteWidth=23;
var _clefWidth=51;

var _pixelsPerNote=8;
var _pixelsPerOctave=_pixelsPerNote*7;
var _lowestNote=52;  //this is low E on the guitar.
var _highestNote=88; //this is high E on the 12th fret of the 1st string.


var _gameLevels = new Array();
var _curLvlIdx=-1;
var _score=0;
var _highScore=0;
var _baseMultiplier=50;
var _maxMultiplier=1000;
var _multiplier;

var _gameType;
var _gameMsg;
var _guessBox;
var _scoreBox;
var _highScoreBox;
var _statusLine;
var _accuracy;
var _lastMidiValue=-1;
var _inPlayMode=false;

var _statusBoard, _sbTHigh, _sbOHigh, _sbTLow, _sbOLow, _sbTAvg, _sbOAvg, _sbTTot, _sbOTot, _sbYourStatus;
var _paused=false;
var _noRanking=false;
var __grckvl=null;
var __grstat=null;


//Octave  Note Numbers 
//        C  C#   D   D#  E   F   F#  G   G#  A   A#  B 
// -1     0   1   2   3   4   5   6   7   8   9   10  11 
// 0      12  13  14  15  16  17  18  19  20  21  22  23 
// 1      24  25  26  27  28  29  30  31  32  33  34  35 
// 2      36  37  38  39  40  41  42  43  44  45  46  47 
// 3      48  49  50  51  52  53  54  55  56  57  58  59 
// 4      60  61  62  63  64  65  66  67  68  69  70  71 
// 5      72  73  74  75  76  77  78  79  80  81  82  83 
// 6      84  85  86  87  88  89  90  91  92  93  94  95 
// 7      96  97  98  99  100 101 102 103 104 105 106 107 
// 8      108 109 110 111 112 113 114 115 116 117 118 119 
// 9      120 121 122 123 124 125 126 127 
// Middle C is C4, or note 60.
// 86 is my high D on the treble clef, and 35 is my low b on the bass clef.


function Initialize()
{
	_statusBoard=document.getElementById("statusBoard");
	_sbTHigh=document.getElementById("sbTHigh");
	_sbOHigh=document.getElementById("sbOHigh");
	_sbTLow=document.getElementById("sbTLow");
	_sbOLow=document.getElementById("sbOLow");
	_sbTAvg=document.getElementById("sbTAvg");
	_sbOAvg=document.getElementById("sbOAvg");
	_sbTTot=document.getElementById("sbTTot");
	_sbOTot=document.getElementById("sbOTot");
	_sbYourStatus=document.getElementById("sbYourStatus");
	_gameMsg=document.getElementById("gameMessage");
	_guessBox=document.getElementById("guessBoxBottom");
	_scoreBox=document.getElementById("scoreBox");
	_highScoreBox=document.getElementById("highScoreBox");
	_statusLine=document.getElementById("statusLine");
	_accuracy=document.getElementById("accuracy");
	_guessNote=new GuessNote();
	ConfigureGameLevels();
	ArrangeStaff();
	$(window).resize(function () { ArrangeStaff(); }); 
	$("div.clef img").click(function() { if (false) toggle_clef(); });

	GetRanking();
	ShowStatusBoard();
	Sound.init(document.getElementById("pitches"));
	init_settings_dialog();
	_gameType = document.getElementById("game-type");
	load_sounds(document.getElementById("sound-mode"));
}


function toggle_clef() {
	if (_inPlayMode)
		return;

	if (this.src.match("TrebleClef.png"))
	{
		this.src = "i/BassClef.png";
		_trebleClef = false;
	}
	else
	{
		this.src = "i/TrebleClef.png";
		_trebleClef = true;
	}
}

function ArrangeStaff()
{
	var width=getWidth()-20;
	_gameWidth=(width<_maxGameWidth?width:_maxGameWidth);
	if (_gameWidth<_minGameWidth)
	{
		_gameWidth=_minGameWidth;
	}
	
	$("div.notegame").css("left",((width/2-(_gameWidth/2))+10)+"px");
	$("div.notegame").css("width",_gameWidth+"px");
	_gameMsg.style.width=(_gameWidth-130)+"px";
	
	if (_totalPixels>0)
	{
		for (i=0;i<_notes.length;i++)
		{
			_notes[i].Position=_notes[i].Position*((width-50)/_totalPixels);
		}
	}
	_totalPixels=width-50;
	
	ArrangeKeyboard();
}

function ArrangeKeyboard()
{
	keyWidth=parseInt((_gameWidth-131)/7);
	ebonyKeyWidth=keyWidth*0.5;
	offset=keyWidth-ebonyKeyWidth/2;
	left=parseInt(_gameWidth-(keyWidth*7));
	$("input#c_pad").css("left",left+"px");
	$("div#c_padlabel").css("left",(left)+"px");
	$("input#c_pad").css("width",(keyWidth+1)+"px");
	$("input#cs_pad").css("left",(left+offset)+"px");
	$("input#cs_pad").css("width",ebonyKeyWidth+"px");
	$("input#d_pad").css("left",(left+keyWidth)+"px");
	$("div#d_padlabel").css("left",(left+keyWidth)+"px");
	$("input#d_pad").css("width",(keyWidth+1)+"px");
	$("input#ds_pad").css("left",(left+keyWidth+offset)+"px");
	$("input#ds_pad").css("width",ebonyKeyWidth+"px");
	$("input#e_pad").css("left",(left+keyWidth*2)+"px");
	$("div#e_padlabel").css("left",(left+keyWidth*2)+"px");
	$("input#e_pad").css("width",(keyWidth+1)+"px");
	$("input#f_pad").css("left",(left+keyWidth*3)+"px");
	$("div#f_padlabel").css("left",(left+keyWidth*3)+"px");
	$("input#f_pad").css("width",(keyWidth+1)+"px");
	$("input#fs_pad").css("left",(left+keyWidth*3+offset)+"px");
	$("input#fs_pad").css("width",ebonyKeyWidth+"px");
	$("input#g_pad").css("left",(left+keyWidth*4)+"px");
	$("div#g_padlabel").css("left",(left+keyWidth*4)+"px");
	$("input#g_pad").css("width",(keyWidth+1)+"px");
	$("input#gs_pad").css("left",(left+keyWidth*4+offset)+"px");
	$("input#gs_pad").css("width",ebonyKeyWidth+"px");
	$("input#a_pad").css("left",(left+keyWidth*5)+"px");
	$("div#a_padlabel").css("left",(left+keyWidth*5)+"px");
	$("input#a_pad").css("width",(keyWidth+1)+"px");
	$("input#as_pad").css("left",(left+keyWidth*5+offset)+"px");
	$("input#as_pad").css("width",ebonyKeyWidth+"px");
	$("input#b_pad").css("left",(left+keyWidth*6)+"px");
	$("div#b_padlabel").css("left",(left+keyWidth*6)+"px");
	$("input#b_pad").css("width",(keyWidth+1)+"px");
	$("input#bs_pad").css("left",(left+keyWidth*6+offset)+"px");
	$("input#bs_pad").css("width",ebonyKeyWidth+"px");
}

function SetKeyNoteLabelsVisibility(isVisible)
{
	v=(isVisible?"visible":"hidden");
	$("div#a_padlabel").css("visibility",v);
	$("div#b_padlabel").css("visibility",v);
	$("div#c_padlabel").css("visibility",v);
	$("div#d_padlabel").css("visibility",v);
	$("div#e_padlabel").css("visibility",v);
	$("div#f_padlabel").css("visibility",v);
	$("div#g_padlabel").css("visibility",v);
}

function StartGame()
{
	_inPlayMode=true;
	_statusBoard.style.visibility="hidden";
	_score=0;
	_scoreBox.innerHTML=_score;
	_multiplier=_baseMultiplier;
	_curLvlIdx=document.getElementById("levels").currentLevel.level - 2;
	_totIncorrectNoteCt=0;
	_totCorrectNoteCt=0;
	_paused=false;
	Seed();
	AdvanceLevel();
	$("input.stopButton").show();
	$("input.startButton").hide();
	show_mute_if_needed();
	show_time.start("div.timeBox div");
	if (_gameType.value == "practice") {
		$("div.timeBox").show(); 
	}
	else {
		$("div.timeBox").hide(); 
	}
}

var show_time = (function() {
	var timer;
	function start(display_element) {
		ms = 0;
		time = (new Date()).getTime();
		target = display_element;
		if (timer) clearInterval(timer);
		timer = setInterval(show_time, 100);
		show_time();
	}
	function stop() {
		clearInterval(timer);
	}
	function show_time () {
		prev = time;
		time = (new Date()).getTime();
		if (_paused)
			return;
		else
			ms += (time - prev);

		var elapsed = parseInt(ms / 1000);
		var seconds = elapsed % 60;
		var minutes = parseInt(elapsed / 60);
		var hours = parseInt(minutes / 60);
		minutes %= 60;
		var time_str = (hours ? z(hours)+":" : "") + z(minutes) + ":" + z(seconds);
		$(target).empty().append(time_str);
	}
	function z(x) {
		return "" + parseInt(x/10) + "" + x%10;
	}
	return { start: start, stop: stop };
})();

function Seed()
{
	$.ajax({
		url: '/ScoreKeeper/GetRanking.php?a=i&d=' + Math.round(new Date().getTime()),
		success: function(data){
			eval(data);
		}
	});
}

function GetRanking()
{
	if (_noRanking) return;

	if (__grckvl==null)
	{
		$.ajax({
			url: '/ScoreKeeper/GetRanking.php?a=rank&app=nqguitar&s=' + _score+
			"&d="+ Math.round(new Date().getTime()),
			success: function(data){
				eval(data);
				if (!_inPlayMode)
				{
					UpdateStatusBoard();
				}
			},
			error: function() {
				show_error_message("Ranking not available");
				_noRanking = true;
			}
		});
	}
	else
	{
		$.ajax({
			url: '/ScoreKeeper/GetRanking.php?a=rank&app=nqguitar&s=' + _score +
			'&ch='+__grckvl.cknm+'-'+__grckvl.ckfn(_score),
			success: function(data){
				eval(data);
				if (!_inPlayMode)
				{
					UpdateStatusBoard();
				}
			},
			error: function() {
				show_error_message("Ranking not available");
				_noRanking = true;
			}
		});
	}
}

function UpdateStatusBoard()
{
	if (_noRanking) return;

	if (!__grstat)
	{
		show_error_message("Ranking data not available");
		_noRanking = true;
		return;
	}

	//__grstat={"nScoresToday":11,"avgToday":32270,"highToday":45000,"lowToday":15000,"nScores":11,"avg":31998,"high":45000,"low":15000 };
	_sbTHigh.innerHTML=__grstat.highToday;
	_sbOHigh.innerHTML=__grstat.high;
	_sbTLow.innerHTML=__grstat.lowToday;
	_sbOLow.innerHTML=__grstat.low;
	_sbTAvg.innerHTML=__grstat.avgToday;
	_sbOAvg.innerHTML=__grstat.avg;
	_sbTTot.innerHTML=__grstat.nScoresToday;
	_sbOTot.innerHTML=__grstat.nScores;
	if (_score==0)
	{
		_sbYourStatus.innerHTML="Welcome!";
	}
	else if (_score==__grstat.low)
	{
		_sbYourStatus.innerHTML="Don't give up!";
	}
	else if (_score==__grstat.lowToday && _score!=__grstat.highToday)
	{
		_sbYourStatus.innerHTML="Don't give up!";
	}
	else if (_score<__grstat.avg*0.75)
	{
		_sbYourStatus.innerHTML="Don't give up!";
	}
	else if (_score<__grstat.avg)
	{
		_sbYourStatus.innerHTML="You're getting there!";
	}
	else if (_score<__grstat.avg*1.1)
	{
		_sbYourStatus.innerHTML="You've been practicing!";
	}
	else if (_score<__grstat.avg*1.3)
	{
		_sbYourStatus.innerHTML="Getting good!!";
	}
	else if (_score<__grstat.avg*1.5)
	{
		_sbYourStatus.innerHTML="Very Good!";
	}
	else if (_score<__grstat.avg*1.7)
	{
		_sbYourStatus.innerHTML="Awesome!";
	}
	else 
	{
		_sbYourStatus.innerHTML="Virtuoso!";
	}
}

//SetHighScore(_score);

function EndGame()
{
	StopGame();
	_inPlayMode=false;

	if (_score>_highScore)
	{
		SetHighScore(_score);
	}
	_gameMsg.innerHTML="Game Over!";
	_gameMsg.style.visibility="visible";
	GetRanking();
	ShowStatusBoard();
	show_mute_if_needed();
	show_time.stop();
}

function StopGame()
{
	_paused=false;
	_gameMsg.style.visibility="hidden";
	if (_timer!=null)
	{
		clearInterval(_timer);
	}
	if (_levelTimer!=null)
	{
		clearInterval(_levelTimer);
	}
	for (i=0;i<_notes.length;i++)
	{
		_notes[i].FrontNote.style.visibility="hidden";
	}
	_notes.length=0;
	//alert("_notes.length="+_notes.length);
	_correctNoteCt=0;
	_displayedNoteCounter=0;
	$("input.stopButton").hide();
	$("input.startButton").show();
}

function ShowStatusBoard() {
	if (__grstat)
		_statusBoard.style.visibility="visible";
	else
		_statusBoard.style.visibility="hidden";
}

//This is the guess note object
function GuessNote()
{
	this.Position=_gameWidth-_noteWidth;
	this.FrontNote=document.getElementById("guessNote");
}

//This is the regular note object
function Note(midiValue)
{
	this.Value=midiValue;
	this.Octave=parseInt(midiValue/12)-1;
	SetNoteValue(this);
	this.Position=_gameWidth-_noteWidth;
	this.FrontNote=document.createElement("img");
	this.FrontNote.setAttribute("class", "note");
	this.FrontNote.setAttribute("style", "visibility:hidden");
	document.getElementById("game").appendChild(this.FrontNote);
	AdjustNoteVerticalPosition(this);
}

function SetNoteValue(note)
{
	interval=note.Value%12;
	switch(interval)
	{
		case 0:
		case 1:
			note.NoteValue="C";
			break;
		case 2:
		case 3:
			note.NoteValue= "D";
			break;
		case 4:
			note.NoteValue= "E";
			break;
		case 5:
		case 6:
			note.NoteValue= "F";
			break;
		case 7:
		case 8:
			note.NoteValue= "G";
			break;
		case 9:
		case 10:
			note.NoteValue= "A";
			break;
		case 11:
			note.NoteValue= "B";
	}
}
  

function AdjustNoteVerticalPosition(note)
{
	switch (note.NoteValue)
	{
		case "C":
			pos=0;
			break;
		case "D":
			pos=1;
			break;
		case "E":
			pos=2;
			break;
		case "F":
			pos=3;
			break;
		case "G":
			pos=4;
			break;
		case "A":
			pos=5;
			break;
		case "B":
			pos=6;
			break;
	}
	if (note.Octave>4)
	{
		note.Offset=0;
		if (note.Octave==6)
		{
				if (note.NoteValue=="C" || note.NoteValue=="E")
				{
					note.FrontNote.src="i/Note_TailDownLineThrough.gif";
				}
				else if (note.NoteValue=="D")
				{
					note.FrontNote.src="i/Note_TailDownLinedBelow.gif";
				}
				else
				{
					note.FrontNote.src="i/Note_TailDown.gif";
				}
		}
		else if (note.Octave==5)
		{
				if (note.NoteValue=="A")
				{
					note.FrontNote.src="i/Note_TailDownLineThrough.gif";
				}
				else if (note.NoteValue=="B")
				{
					note.FrontNote.src="i/Note_TailDownLinedBelow.gif";
				}
				else
				{
					note.FrontNote.src="i/Note_TailDown.gif";
				}
		}
		else
		{
			note.FrontNote.src="i/Note_TailDown.gif";
		}
	}
	else if (note.Octave>3)
	{
		note.Offset=-39;
		if (note.NoteValue=="C")
		{
			note.FrontNote.src="i/Note_TailUpLineThrough.gif"; //Middle C
		}
		else
		{
			note.FrontNote.src="i/Note_TailUp.gif";
		}
	}
	//Octave  Note Numbers 
	//        C  C#   D   D#  E   F   F#  G   G#  A   A#  B 
	// -1     0   1   2   3   4   5   6   7   8   9   10  11 
	// 0      12  13  14  15  16  17  18  19  20  21  22  23 
	// 1      24  25  26  27  28  29  30  31  32  33  34  35 
	// 2      36  37  38  39  40  41  42  43  44  45  46  47 
	// 3      48  49  50  51  52  53  54  55  56  57  58  59 
	// 4      60  61  62  63  64  65  66  67  68  69  70  71 
	// 5      72  73  74  75  76  77  78  79  80  81  82  83 
	// 6      84  85  86  87  88  89  90  91  92  93  94  95 
	// 7      96  97  98  99  100 101 102 103 104 105 106 107 
	// 8      108 109 110 111 112 113 114 115 116 117 118 119 
	// 9      120 121 122 123 124 125 126 127 
	// Middle C is C4, or note 60.
	// 86 is my high D on the treble clef, and 35 is my low b on the bass clef.
	else //should only be octave 3 (Midi notes 52 (E) through 59 (B))
	{
		_statusLine.innerHTML="o="+note.Octave+", n="+note.NoteValue;
		note.Offset=-39;
		if (note.NoteValue=="E" || note.NoteValue=="G" || note.NoteValue=="B")
		{
			note.FrontNote.src="i/Note_TailUpLined.gif";
		}
		else
		{
			note.FrontNote.src="i/Note_TailUpLineThrough.gif";
		}
	}
	mytop=((6-note.Octave)*_pixelsPerOctave-(pos*_pixelsPerNote)+21+note.Offset)+"px"; 
	//alert("positioning "+note.Octave+","+note.NoteValue+" at "+mytop);
	note.FrontNote.style.top=mytop; 
}

function SetHighScore(score)
{
	_highScore=score;
	_highScoreBox.innerHTML=_highScore;
}

function Animate()
{
	if (_paused)
	{
		return;
	}
	
	if (_notes.length>0 && _notes[0].Position<_clefWidth+70)
	{
		if (_gameType.value == "practice") {
			_multiplier=0;
			_score=0;
			var note=_notes[0];
			keyPadPress(note.NoteValue);
			return;
		}
		// gameType == "standard"
		EndGame();
		return;
	}
	
	
	for (i=0;i<_notes.length;i++)
	{
		var note = _notes[i];
		note.Position -= _pxPerAni;
		note.FrontNote.style.left = note.Position+"px";
		note.FrontNote.style.visibility = "visible";
	}
	msSinceLastNote=(new Date()).getTime()-_lastNoteTimeMs;
	if (_gameLevels[_curLvlIdx].NotesInLvl<=_correctNoteCt)
	{
		AdvanceLevel();
		return;
	}
	
	if ((msSinceLastNote>_gameLevels[_curLvlIdx].MsPerNote && _displayedNoteCounter<_gameLevels[_curLvlIdx].NotesInLvl) || _notes.length==0)
	{
		AddNote();
	}
}

function AddNote()
{
	note=get_new_Note();
	if (note.Value == _lastMidiValue) {
		note=get_new_Note(); // this tolerates some duplicates, but not too many
	}
	time=(new Date()).getTime();
	_notes.push(note);
	_lastMidiValue=note.Value;
	_lastNoteTimeMs=time;
	_displayedNoteCounter++;
	if (document.getElementById("sound-mode").value == "new")
		Sound.play(note.NoteValue + note.Octave);
}

function keyPadPress(keychar)
{
	if (_paused || !_inPlayMode) {
		Sound.play(keychar+"4");
		return;
	}
	if (_notes.length>0 && !_paused) 
	{
		_guessBox.innerHTML=keychar;
		_guessNote.Octave=_notes[0].Octave;
		if (_guessNote.Octave==3 && (keychar=="C" || keychar=="D"))
		{
			_guessNote.Octave++;
		}
		else if (_guessNote.Octave==6 && keychar!="C" && keychar!="D" && keychar!="E")
		{
			_guessNote.Octave--;
		}
		_guessNote.NoteValue=keychar;
		AdjustNoteVerticalPosition(_guessNote);
						
		if (_notes[0].NoteValue==keychar) // && !_paused) //put this one in to debug
		{
			//success!
			note=_notes.shift();
			document.getElementById("game").removeChild(note.FrontNote);
			if (document.getElementById("sound-mode").value == "key")
				Sound.play(note.NoteValue + note.Octave);
			_correctNoteCt++;
			_totCorrectNoteCt++;
			_statusLine.innerHTML="good job!";
			if (_multiplier<0)
			{
				_multiplier=_baseMultiplier;
			}
			else
			{
				_multiplier=_multiplier*2;
				if (_multiplier>_maxMultiplier)
				{
					_multiplier=_maxMultiplier;
				}
			}
			AddScore();
		}
		else
		{
			if (document.getElementById("sound-mode").value != "off")
				new Audio("s/err/err" + parseInt(Math.random() * 5 + 1) + ".wav").play();
			_totIncorrectNoteCt++;
			//_statusLine.innerHTML="oops!";
			if (_multiplier>0)
			{
				_multiplier=-_baseMultiplier;
			}
			else
			{
				_multiplier=_multiplier*2;
				if (_multiplier<_maxMultiplier*-1)
				{
					_multiplier=_maxMultiplier*-1;
				}
			}
			AddScore();
		}
		_accuracy.innerHTML=parseInt((_totCorrectNoteCt/(_totCorrectNoteCt+_totIncorrectNoteCt))*100)+"%";
	}
}
function keyPress(e)
{
	if(window.event) // IE
	{
		keynum = e.keyCode
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keynum = e.which
	}
	else
	{
		keynum = e.keyCode
	}
	
	if (keynum==32)
	{
		if (!_inPlayMode)
		{
			StartGame();
			return;
		}
		_paused=!_paused;
		if (_paused)
		{
			_gameMsg.innerHTML="Paused! ('space' to resume)";
			_gameMsg.style.visibility="visible";
		}
		else
		{
			_gameMsg.style.visibility="hidden";
		}
		show_mute_if_needed();
	}
	if (keynum==43)
	{ // +
		if (!_inPlayMode)
			StartGame();
		else
			AdvanceLevel();
	}
	if (keynum==45)
	{ // -
		if (!_inPlayMode)
			StartGame();
		_curLvlIdx -= 2;
		if (_curLvlIdx < -1) _curLvlIdx = -1;
		AdvanceLevel();
	}
	if (keynum==27 || keynum==88 || keynum==120)
	{ // escape, x, X
		if (_inPlayMode)
			EndGame();
	}
	
	if (document.getElementById("keyb-type").value == "S-L")
	{
		var i = "SsDdFfGgHhJjKkLl".indexOf(String.fromCharCode(keynum));
		if (i == -1) return;
		keychar = "CDEFGABC".charAt(i/2);
	}
	else
	{

		if (keynum<65 || keynum>71)
		{
			if (keynum>96 && keynum<104)
			{
				keynum-=32;
			}
			else
			{
				return;
			}
		}
		
		keychar=String.fromCharCode(keynum);
	}

	keyPadPress(keychar);
	return false;
}

function AddScore()
{
	_score+=_multiplier;
	_scoreBox.innerHTML=_score;
}

function ConfigureGameLevels()
{
	_gameLevels.length=0;
	_gameLevels.push(new GameLevel("Level 1", 35, 86, 40000, 5000, 30, true));
	_gameLevels.push(new GameLevel("Level 2", 35, 86, 30000, 4500, 30, true));
	_gameLevels.push(new GameLevel("Level 3", 35, 86, 25000, 4000, 35, true));
	_gameLevels.push(new GameLevel("Level 4", 35, 86, 20000, 3500, 35, true));
	_gameLevels.push(new GameLevel("Level 5", 35, 86, 15000, 3000, 35, true));
	_gameLevels.push(new GameLevel("Level 6", 35, 86, 12500, 2500, 40, false));
	_gameLevels.push(new GameLevel("Level 7", 35, 86, 10000, 2000, 40, false));
	_gameLevels.push(new GameLevel("Level 8", 35, 86, 7500, 1750, 40, false));
	_gameLevels.push(new GameLevel("Level 9", 35, 86, 6500, 1500, 40, false));
	_gameLevels.push(new GameLevel("Level 10", 35, 86, 6000, 1250, 40, false));
	_gameLevels.push(new GameLevel("Level 11", 35, 86, 5500, 1000, 40, false));
	_gameLevels.push(new GameLevel("Level 12", 35, 86, 5000, 750, 40, false));
	_gameLevels.push(new GameLevel("Level 13", 35, 86, 4500, 500, 40, false));
	_gameLevels.push(new GameLevel("Level 14", 35, 86, 4000, 400, 40, false));
	_gameLevels.push(new GameLevel("Level 15", 35, 86, 3500, 300, 40, false));
	_gameLevels.push(new GameLevel("Level 16", 35, 86, 3000, 275, 40, false));
	_gameLevels.push(new GameLevel("Level 17", 35, 86, 2750, 250, 40, false));
	_gameLevels.push(new GameLevel("Level 18", 35, 86, 2500, 200, 40, false));
	_gameLevels.push(new GameLevel("Level 19", 35, 86, 2250, 150, 40, false));
	_gameLevels.push(new GameLevel("Level 20", 35, 86, 2000, 135, 40, false));
	_gameLevels.push(new GameLevel("Level 21", 35, 86, 1750, 120, 40, false));
	_gameLevels.push(new GameLevel("Level 22", 35, 86, 1500, 105, 40, false));
	_gameLevels.push(new GameLevel("Level 23", 35, 86, 1250, 100, 40, false));
	_gameLevels.push(new GameLevel("Level 24", 35, 86, 1000, 95, 40, false));
	_gameLevels.push(new GameLevel("Level 25", 35, 86, 750, 90, 40, false));
}

function GameLevel(title, lowestNote, highestNote, MsAcrossScreen, MsPerNote, NotesInLvl, KeyLabelsVisible)
{
	this.Title=title;
	this.LowestNote=lowestNote;
	this.HighestNote=highestNote;
	this.MsAcrossScreen=MsAcrossScreen;
	this.MsPerNote=MsPerNote;
	this.NotesInLvl=NotesInLvl;
	this.KeyLabelsVisible=KeyLabelsVisible;
}

function AdvanceLevel()
{
	StopGame();
	$("input.startButton").hide();
	$("input.stopButton").show();
	if (_curLvlIdx<_gameLevels.length-1)
	{
		_curLvlIdx++;
	}
	SetKeyNoteLabelsVisibility(_gameLevels[_curLvlIdx].KeyLabelsVisible);
	_gameMsg.innerHTML="Get Ready For "+_gameLevels[_curLvlIdx].Title+"!";
	_gameMsg.style.visibility="visible";
	_levelTimer=setInterval(StartLevel, _msForLvlMsg);
	_pxPerAni=((_gameWidth-_clefWidth-_noteWidth)*_msPerAni)/_gameLevels[_curLvlIdx].MsAcrossScreen;  //parseInt(_gameWidth/_maxGameWidth);

}

function StartLevel()
{
	if (!_paused)
	{
		_gameMsg.style.visibility="hidden";
		clearInterval(_levelTimer);
		AddNote();
		_timer=setInterval(Animate, _msPerAni);
	}
}

function GetMidiValue(octave, noteValue)
{
	ov=(octave+1)*12;
	switch (noteValue)
	{
		case "C":
			return ov;
		case "D":
			return ov+2;
		case "E":
			return ov+4;
		case "F":
			return ov+5;
		case "G":
			return ov+7;
		case "A":
			return ov+9;
		case "B":
			return ov+11;
	}
	return ov;
}

function Validate()
{
	l=window.location.href;
	if (l.toLowerCase().indexOf("readmusicfree.com")==-1)
	{
		GoHome();
	}
	zz=l.indexOf("zz=");
	if (zz==-1)
	{
		GoHome();
		return;
	}
	idx=zz+3;
	while (idx<l.length && IsDigit(l[idx]))
	{
		idx++;
	}
	dt=l.substring(zz+3,idx);
	dtN=(new Date()).getTime();
	if (dt<dtN-10000 || dt>dtN)
	{
		GoHome();
		return;
	}
	
}

function IsDigit(num) {
	if (num.length>1){return false;}
	var string="1234567890";
	if (string.indexOf(num)!=-1){return true;}
	return false;
}

function GoHome()
{
	top.location="../notablyquickguitar.html";
}


var err_msg_timer;
function show_error_message(txt) {
	if (err_msg_timer) clearTimeout(err_msg_timer);
	$("div.error_message").empty().append(txt).show();
	err_msg_timer = setTimeout(function() { $("div.error_message").hide() }, 2000);
}

//
// functions getWidth/Height extracted and simplified from j/std.js
//

function getWidth()
{
	d=document;
	if (typeof window.innerWidth!='undefined') 
	{
		return window.innerWidth;
	} 
	else 
	{
		if (d.documentElement && 
			typeof d.documentElement.clientWidth!='undefined' &&
			d.documentElement.clientWidth!=0) 
		{
			return d.documentElement.clientWidth;
		} 
		else 
		{
			if (d.body &&  typeof d.body.clientWidth!='undefined') 
			{
				return d.body.clientWidth; //IE
			}
		}
	}
}


//
// Sound, Stats and Settings management - OlafWorks 2011-11
//

var Sound = {
	note : {},
	nb_notes : 0,
	
	init : function(div) {
		var list = div.getElementsByTagName("li");
		for (var i=0; i < list.length; i++)
			this.add_note(list[i]);
	},

	add_note : function(elt) {
		var note = {};
		var sound = document.createElement("audio");
		note.noteName  = elt.getAttribute("label");
		note.midiValue = elt.getAttribute("midi");
		note.sound = sound;
		sound.note = note;
		sound.addEventListener("ended", Sound.stop, false);
		sound.addEventListener("canplaythrough", Sound.loaded, false);
		sound.preload = "auto";
		sound.src = elt.getAttribute("file");
		this.note[note.noteName] = note;
		this.nb_notes++;
	},

	play : function (note_name) {
		this.stop();
		this.curr = this.note[note_name];
		if (this.curr) {
			this.curr.sound.currentTime = 0;
			this.curr.sound.play();
		}
	},

	stop : function () {
		if (this.curr) {
			this.curr.sound.pause();
			this.curr = null;
		}
	},

	load : function(callback) {
		this.load_(callback, 200);
	},

	load_ : function(callback, remaining_rounds) {
		var nb_loaded = 0;
		var need_wait = 0;
		for (var i in this.note) {
			var sound = this.note[i].sound;
			if (sound.loaded) {
				nb_loaded++;
				continue;
			}
			need_wait++;
			if (!sound.loading) {
				sound.loading = true;
				sound.load();
				sound.play();
				//setTimeout(function(){sound.pause()}, 100);
				//break;
			}
			break;
		}
		callback.progress(nb_loaded, this.nb_notes);
		if (!remaining_rounds)
			callback.error();
		else if (need_wait)
			setTimeout(function() { Sound.load_(callback, remaining_rounds-1) }, 50);
		else
			callback.success();
	},
	
	loaded : function(e) {
		var sound = e.target;
		sound.removeEventListener("canplaythrough", Sound.loaded, false);
		sound.loaded = true;
		sound.loading = false;
	},
}


function load_sounds(control)
{
	if (control.loading) return;
	control.loading = true;

	$("div.loading img").css("visibility", "visible");
	$("div.loading div .done").css("visibility", "hidden");
	$("div.loading div .fail").css("visibility", "hidden");
	$("div.loading div .progress").empty();
	$("div.loading").show();

	function update_display(state)
	{
		$("div.loading img").css("visibility", "hidden");
		$("div.loading div ." + state).css("visibility", "visible");
		setTimeout(function() {
			$("div.loading").hide();
			control.loading = false
		} , 2000);
	}
	Sound.load({
		success	: function() {
			update_display("done");
			$("div.loading div .progress").empty();
			control.sound_loaded = true;
		},
		error	: function() {
			update_display("fail");
			$("div.loading div .progress").empty();
			//control.value = "off";
			control.sound_loaded = true;
		},
		progress: function(nb_done, nb_total) {
			$("div.loading div .progress").empty().append(nb_done + "/" + nb_total);
		},
	});
}

function toggle_keyb(control)
{
	control.value = control.value == "A-G" ? "S-L" : "A-G";
}

function toggle_game(control)
{
	control.value = control.value == "standard" ? "practice" : "standard";
}

function select_sound_mode(control)
{
	if (control.loading) return;

	control.value = 
		control.value == "key" ? "new" : 
		control.value == "new" ? "off" : "key" ;

	if (control.value != "off" && ! control.sound_loaded)
	{
		load_sounds(control);
	}
	show_mute_if_needed();
}

function show_mute_if_needed()
{
	if (_paused || !_inPlayMode || $("#sound-mode").val() != "off")
		$("img.mute-on").hide();
	else
		$("img.mute-on").show();
}

function toggle_settings()
{
	var div = document.getElementById("settings");
	div.style.display = div.style.display == "none" ? "" : "none";
}

function init_settings_dialog()
{
	make_game_controls();
	make_pitches_selector();
	make_levels_selector();
	$("input.close").click(toggle_settings);
	$("img.mute-on").click(toggle_settings);
	$("input.settingsButton").click(toggle_settings);
}

function make_game_controls()
{
	$("div.game-type").append(
		'Game<br><input style="width:6em" type="button" id="game-type" \
		 onclick="toggle_game(this)" value="standard"/>');
	$("div.keyb-type").append(
		'Keys<br><input style="width:4em" type="button" id="keyb-type" \
		 onclick="toggle_keyb(this)" value="A-G"/>');
	$("div.sound-mode").append(
		'Sound<br><input style="width:4em" type="button" id="sound-mode" \
		 onclick="select_sound_mode(this)" value="off"/>');
}

function make_pitches_selector()
{
	var div = document.getElementById("pitches");
	var lst = div.getElementsByTagName("li");
	while (elt = lst[0])
	{
		var butt = document.createElement("input");
		butt.type = "button";
		butt.value = elt.getAttribute("label");
		butt.setAttribute("style", "");
		butt.onclick = function(e) { toggle_button(e.target) };
		butt.selected = true;
		Sound.note[butt.value].button = butt;
		div.replaceChild(butt, elt);
	}
	var helpers = { "all":true, "x":false };
	for (b in helpers)
	{
		var butt = document.createElement("input");
		butt.setAttribute("type", "button");
		butt.setAttribute("value", b);
		butt.setAttribute("onclick", "select_all_pitches("+helpers[b]+")");
		div.appendChild(butt);
	}
}

function make_levels_selector()
{
	var div = document.getElementById("levels");
	var lst = div.getElementsByTagName("li");
	while (elt = lst[0])
	{
		var butt = document.createElement("input");
		butt.setAttribute("type", "button");
		butt.setAttribute("value", elt.getAttribute("label"));
		butt.setAttribute("style", "");
		butt.onclick = function(e) { set_level(e.target); };
		butt.level = elt.getAttribute("level");
		butt.selected = true;
		toggle_button(butt);
		div.replaceChild(butt, elt);
	}
	toggle_button(div.currentLevel = div.getElementsByTagName("input")[0]);
}

function set_level(butt)
{
	toggle_button(butt.parentNode.currentLevel);
	toggle_button(butt);
	butt.parentNode.currentLevel = butt;
	StopGame();
	StartGame();
}

function toggle_button(butt)
{
	if (butt.selected)
	{
		butt.style.color = "grey";
		butt.selected = false;
	}
	else
	{
		butt.style.color = "";
		butt.selected = true;
	}
}

function select_all_pitches(do_select)
{
	for (var i in Sound.note)
	{
		var button = Sound.note[i].button;
		button.selected = !do_select;
		toggle_button(button);
	}
}

function get_selected_notes()
{
	var notes = [];
	for (var i in Sound.note)
	{
		var button = Sound.note[i].button;
		if (button.selected)
			notes.push(button.value);
	}
	return notes;
}

function get_new_Note()
{
	var notes = get_selected_notes();
	apply_density(notes);
	var rand = parseInt(Math.random() * notes.length);
	notes.push("G4"); // handle case where notes is empty (no notes selected in settings)

	return new Note(Sound.note[notes[rand]].midiValue);
}

function update_note_stats(note, reactionTimeMs)
{
	note.stats.count += 1;
	note.stats.avg_t += (reactionTimeMs - this.stats[note].avg_t)/this.stats[note].count;
}

function apply_density(notes)
{
}
