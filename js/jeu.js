var lignes, colonnes, vielle_ligne, vielle_colonne; //Variables pour recuperer les lignes et colonnes que l'utilisateur veut
var mines, mines_restantes, mines_reveles, placement_mines;

var etat_game; //Variable qui va permettre de renseigner l'etat d'avancement du jeu.

var tableau, images, cases; //Variable qui va nous permettres de créer le jeu et de positionner les images et avoir un état des cases(mines, drapeau, ?...)

var id, position_top, position_left; //Variable id qui va permettre de différencier chaque case du jeu.

var jouable; //Variable boolean pour terminer la partie si l'utilisateur à perdu ou à gagner (permet d'eviter de cliquer encore alors qu'il a perdu)

var nb_case_explore, meilleur_score_case, meilleur_score_mine, score; //Var pour le score et le best score

var audio_gameover = new Audio('audio/audio_explosion.mp3');
var audio_win = new Audio('audio/audio_win.mp3');
var audio_plantage_drapeau = new Audio('audio/audio_plantage_drapeau.mp3');  //Var sound pour rajouter un peu d'ambiance
var audio_hum_question = new Audio('audio/audio_hum_question.mp3');

etat_game = document.getElementById("etat_game"); //On recupere l'id de la page html index.html

document.oncontextmenu = new Function("return false"); //TRES IMPORTANT permet de bloquer le clique droit !

document.getElementById("recommencer").disabled = true; //On disable le bouton recommencer

//Function qui va valider la saisie de l'utilisateur
function validation_config() {
	lignes = document.getElementById("lignes").value;
	colonnes = document.getElementById("colonnes").value;  //On recupereres es valeurs
	mines = document.getElementById("mines").value;
	if(lignes == "" || colonnes == "" || mines == "") { //Si les valeurs sont vides alors erreur
		alert("[Erreur] Lignes, Colonnes ou Mines ne peuvent pas être vide !");
		return false;
	} else { // sinon
		if((isNaN(lignes)) && (isNaN(colonnes)) && (isNaN(mines))) { // si les valeurs ne sont pas des nombres alors on retourne une erreur
			alert("[Erreur] Vous devez mettre des chiffres obligatoirement !");
			return false;
		} else { //sinon
			var total_case = lignes*colonnes;
			if(total_case < mines) { //si le total des cases et inférieur à mine alors erreur
				alert("[Erreur] Vous avez au total " + total_case + " cases pour " + mines + " à placer, c'est impossible");
				return false;
			} else if(mines == 0) { //sinon si les mines à 0 alors erreur
				alert("[Erreur] Vous avez renseignées 0 mines !");
				return false;
      }
        else if(mines == total_case) { //ou sinon pour terminer les mines sont = aux total_case alors erreur
        alert("[Erreur] Il y a " + total_case + " cases et vous voulez mettre " + mines + " mines !");
        return false;
			} else { //sinon 
				if((lignes < 2) || (colonnes < 2)) {
					alert("[Erreur] Ligne et colonne ne peuvent pas être inférieur à 2 !");
					return false;
				} else { //Si il y a pas eu d'erreur alors on ParseInt les valeurs reçus ! Important sinon pas de bon fonctionnement !
          reset_img(); //Si auparavant il y a eu déjà une création d'une partie on reset le tableau et les images pour éviter de faire bug l'affichage
          lignes = parseInt(document.getElementById("lignes").value);
					colonnes = parseInt(document.getElementById("colonnes").value);
          mines = parseInt(document.getElementById("mines").value);
          vielle_colonne = colonnes;
          vielle_ligne = lignes;
					initialisation_game(); //On initialise le jeu avec cette fonction
				}
			}
		}
	}
}

//Function qui lorsque l'utilisateur appuie sur le bouton recommencer alors on effectue la fonction la
function restart() {
  colonnes = vielle_colonne;
  lignes = vielle_ligne; //On set les anciennes lignes aux nouvelles lignes;
  initialisation_game(); //Puis on relance une initialisation 
}

//Function qui permet de reset la partie visuel des cases images
function reset_img() {
  for (var ligne = 0; ligne < vielle_ligne; ligne++) { //On recupere les lignes anciennes sinon erreur
    for (var colonne = 0;  colonne < vielle_colonne; colonne++) { //idem pour les colonnes
      id = ligne * vielle_colonne + colonne; //On recupere l'id de chaque images
      var image = document.getElementById(id); //On recupere l'id de l'element de l'image
      if(image !== null) { //Verification obligatoire pour eviter le crash si aucune image n'est présente
        image.parentNode.removeChild(image);  //On delete les images
      }
    }
  }
}

//Fonction qui va permettre d'initialiser la game
function initialisation_game() {

  nb_case_explore = 0; //On reset les variables scores
  score = 0;
  document.getElementById("recommencer").disabled = true; //Le bouton recommencer est desactive. L'utilisateur doit perdre pour le reactiver ou gagner
  jouable = true; //Variable qui permet de pouvoir cliquer sur les images tant que l'utilisateur ne perd pas.
  mines_restantes = mines;
  mines_reveles = 0; //Idem reset variable
  etat_game.innerHTML = 'Cliquez sur les cases pour commencer à Déminer !'; //On informe l'utilisateur pour qu'il commence à déminer
  etat_game.style = 'background-color: lightgray;';

  tableau = new Array(lignes);
  images = new Array(lignes);  //On creer les tableaux multi pour creer le jeu.
  cases = new Array(lignes);
  for (var i = 0; i < tableau.length; i++) {
    tableau[i] = new Array(colonnes);
    images[i] = new Array(colonnes);
    cases[i] = new Array(colonnes);
  }

  //Les for ici vont générer la grille
  for (var ligne = 0; ligne < lignes; ligne++) {
    for (var colonne = 0;  colonne < colonnes; colonne++) {
      id = ligne * colonnes + colonne; //Permet de mettre un id sur chaque case
      position_top = 250 + ligne * 30; //Permet de positionner correctement case ligne et colonne
      position_left = 30 + colonne * 30;
      cases[ligne][colonne] = document.createElement('img'); //On créer l'élement img
      cases[ligne][colonne].src = 'images/non_decouvert.png'; //Source case non decouvert
      cases[ligne][colonne].style = 'position:absolute;height:30px; width: 30px; top:' + position_top + 'px; left:' + position_left + 'px;';
      cases[ligne][colonne].addEventListener('mousedown', clique_jeu); //IMPORTANT il faut ajouter un EVENT à l'élement img pour que l'utilisateur puisse cliquer dessus
      cases[ligne][colonne].id = id; //On ajoute l'id
      document.body.appendChild(cases[ligne][colonne]); 
      images[ligne][colonne] = 'non_decouvert'; //On ajoute à tous les images le type non_decouvert
      tableau[ligne][colonne] = '';
    }
  }

  placement_mines = 0;
  //While tres important ici pour placer les mines aléatoirement
  while (placement_mines < mines) { //Tant que la variable placement_mines est inférieur aux mines que l'utilisateur a renseigné.

    var colonne = Math.floor(Math.random() * colonnes); //On random effectue un random sur le total de colonnes et de lignes
    var ligne = Math.floor(Math.random() * lignes); //On stocke dans les variables 

    if (tableau[ligne][colonne] != 'mine') { //Si dans la var tableau[numero de ligne random][numero de colonne random] il n'y a pas de texte mine

      tableau[ligne][colonne] = 'mine'; //Alors on l'ajoute
      placement_mines++; //Puis on incremente placement_mines.

    }

  } 

  //Ici cette section permet de verifer le nombre qu'il a aux alentours et ainsi d'incrementer le nombre de chiffre 
  for (let colonne = 0; colonne < colonnes; colonne++) {
    for (let ligne = 0; ligne < lignes; ligne++) {
      if (verif(ligne, colonne) != 'mine') {
        //Ici on a tous les cas possibles pour verifer les mines au alentours
        tableau[ligne][colonne] = ((verif(ligne + 1, colonne) == 'mine') || 0) + 
        ((verif(ligne + 1, colonne - 1) == 'mine') || 0) + 
        ((verif(ligne + 1, colonne + 1) == 'mine') || 0) + 
        ((verif(ligne - 1, colonne) == 'mine') || 0) +
        ((verif(ligne - 1, colonne - 1) == 'mine') || 0) +
        ((verif(ligne - 1, colonne + 1) == 'mine') || 0) +
        ((verif(ligne, colonne - 1) == 'mine') || 0) +
        ((verif(ligne, colonne + 1) == 'mine') || 0);
      }
    }
  }
}

//Fonction de verification pour check col et lig qui est retourne la valeur dans le tableau ligne colonne
function verif(ligne, colonne) {
  if (colonne >= 0 && ligne >= 0 && colonne < colonnes && ligne < lignes) {
    return tableau[ligne][colonne];
  }
}

//Fonction qui permet d'afficher l'image des bombes desarmocé quand l'utilisateur gagne !
function bombe_desamorce() {
  for (var ligne = 0; ligne < lignes; ligne++) {
    for (var colonne = 0;  colonne < colonnes; colonne++) { //On get les lignes et colonnes et on verif si dans le tableau on a une mine si oui on remplace l'image
      if(tableau[ligne][colonne] == "mine") {
        cases[ligne][colonne].src = 'images/mine_desamorce.png';
      }
    }
  }
}

//Fonction qui va permettre de cliquer sur les cases et aussi mettre en place les drapeaux ou les questions
function clique_jeu(event) {
  let source = event.target; //On recupere la source
  let id = source.id;
  let ligne = Math.floor(id / colonnes);
  let colonne = id % colonnes;
  if(jouable == true) { //Si le jeu est toujours jouable alors on rentre ici
    if (event.which == 3) { //Si il clique droit
      switch (images[ligne][colonne]) {
        case 'non_decouvert': //Et que l'image est non decouvert
          cases[ligne][colonne].src = 'images/drapeau.png'; //On remplace img par le drapeau
          mines_restantes--; //On retire une mine
          images[ligne][colonne] = 'drapeau';
          audio_plantage_drapeau.play(); //On joue le son
          break;
        case 'drapeau': //idem ici si c'est un drapeau on met l'img question
          cases[ligne][colonne].src = 'images/question.png';
          mines_restantes++; //On reajoute une mine
          images[ligne][colonne] = 'question';
          audio_hum_question.play();
          break;
        case 'question': //Ici on revient au point de depart
          cases[ligne][colonne].src = 'images/non_decouvert.png';
          images[ligne][colonne] = 'non_decouvert'; 
          break;
      }
    event.preventDefault();
  }
  //Informe l'utilisateur le nb de mine qu'il lui reste
  etat_game.innerHTML = 'Mines restantes : ' + mines_restantes;
  
  if (event.which == 1 && images[ligne][colonne] != 'drapeau') {
    if (tableau[ligne][colonne] == 'mine') {
      for (let ligne = 0; ligne < lignes; ligne++)
        for (let colonne = 0; colonne < colonnes; colonne++) {
          if (tableau[ligne][colonne] == 'mine') {
            cases[ligne][colonne].src = 'images/mine.png';
          }
          if (tableau[ligne][colonne] != 'mine' && images[ligne][colonne] == 'drapeau') {
            cases[ligne][colonne].src = 'images/erreur_pas_de_mine_ici.png';
          }
        }
        score = nb_case_explore;
      etat_game.innerHTML = 'GAME OVER<br>Votre score :<br>Cases explorées : '+ score +'<br>Mine à chercher : '+ mines +'';
      etat_game.style = "background-color: #f92424;";
      jouable = false;
      document.getElementById("recommencer").disabled = false;
      audio_gameover.play();
    } else
    if (images[ligne][colonne] == 'non_decouvert') reveler_case(ligne, colonne);
  }
 
    if (mines_reveles == lignes * colonnes - mines) {
      score = nb_case_explore;
      if((meilleur_score_case == null) || (meilleur_score_mine == null)) {
        meilleur_score_case = score;
        meilleur_score_mine = mines;
        etat_game.innerHTML = 'Mines Désarmorcées !<br>NOUVEAU RECORD : '+ score +' cases explorées<br>Mine à chercher : '+ mines +'';
        etat_game.style = "background-color: #6ff42c;";
      } else {
        if((score > meilleur_score_case) || (mines > meilleur_score_mine)) {
          etat_game.innerHTML = 'Mines Désarmorcées !<br>NOUVEAU RECORD : '+ score +' cases explorées<br>Mine à chercher : '+ mines +'';
          etat_game.style = "background-color: #6ff42c;";
        } else {
          etat_game.innerHTML = 'Mines Désarmorcées !<br>Votre score : '+ score +' cases explorées<br>Mine à chercher : '+ mines +'<br>Meilleur Score : ';
          etat_game.style = "background-color: #6ff42c;";
        }
      }
      document.getElementById("recommencer").disabled = false;
      bombe_desamorce();
      jouable = false;
      audio_win.play();
    }
  }
}
 
//Fonction qui permet de reveler les cases lorsque l'utilisateur clique sur une case
function reveler_case(ligne, colonne) {

  cases[ligne][colonne].src = 'images/' + tableau[ligne][colonne] + '.png'; //On get les chiffres

  if (tableau[ligne][colonne] != 'mine' && images[ligne][colonne] == 'non_decouvert') {
    mines_reveles++; //On incremente alors
  }

  images[ligne][colonne] = tableau[ligne][colonne];
 
  if (tableau[ligne][colonne] == 0) {

    if (colonne > 0 && images[ligne][colonne - 1] == 'non_decouvert') {
      reveler_case(ligne, colonne - 1);
    }
    if (colonne < (colonnes - 1) && images[ligne][+colonne + 1] == 'non_decouvert') {
      reveler_case(ligne, +colonne + 1);
    }
    if (ligne < (lignes - 1) && images[+ligne + 1][colonne] == 'non_decouvert') {
      reveler_case(+ligne + 1, colonne);
    }
    if (ligne > 0 && images[ligne - 1][colonne] == 'non_decouvert'){
      reveler_case(ligne - 1, colonne);
    }
    if (colonne > 0 && ligne > 0 && images[ligne - 1][colonne - 1] == 'non_decouvert'){
      reveler_case(ligne - 1, colonne - 1);
    }
    if (colonne > 0 && ligne < (lignes - 1) && images[+ligne + 1][colonne - 1] == 'non_decouvert') {
      reveler_case(+ligne + 1, colonne - 1);
    }
    if (colonne < (colonnes - 1) && ligne < (lignes - 1) && images[+ligne + 1][+colonne + 1] == 'non_decouvert'){
      reveler_case(+ligne + 1, +colonne + 1);
    }
    if (colonne < (colonnes - 1) && ligne > 0 && images[ligne - 1][+colonne + 1] == 'non_decouvert') {
      reveler_case(ligne - 1, +colonne + 1);
    }
  }
  nb_case_explore++; //Variable pour le score
}
