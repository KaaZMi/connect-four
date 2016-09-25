var grille = new Array();
var partiefinie = false;
var nbCoups = 0;
var difficulty;

for (colonne=0; colonne < 7; colonne++)
{
	grille[colonne] = new Array(); // chaque colonne est un tableau (de cases)
}

for ( colonne=0 ; colonne < 7 ; colonne++ )
{
	for ( ligne=0 ; ligne < 6 ; ligne++ )
	{
		grille[colonne][ligne] = 0; // 0: case libre, 1: case joueur, 2: case IA
	}
}

/* Vu par grille[i][j]
* 00 10 20 30 40 50 60
* 01 11 21 31 41 51 61
* 02 12 22 32 42 52 62
* 03 13 23 33 43 53 63
* 04 14 24 34 44 54 64
* 05 15 25 35 45 55 65
*/

/* Vu par le DOM HTML
* 11 21 31 41 51 61 71
* 12 22 32 42 52 62 72
* 13 23 33 43 53 63 73
* 14 24 34 44 54 64 74
* 15 25 35 45 55 65 75
* 16 26 36 46 56 66 76
*/

// EXEMPLE : si l'humain place son jeton en 34, côté JS c'est la case 23.

/*
* L'humain commence la partie.
* La partie se lance au clic d'un joueur sur une colonne.
* Le tour de l'IA vient automatiquement à la suite du coup de l'humain.
*/
function game(col)
{
	if (grille[col-1][0] == 0 && !partiefinie) // si la colonne n'est pas pleine
	{
		/*
		* --------------------------------------------------------
		* ------------------ Tour du joueur ----------------------
		* --------------------------------------------------------
		*/
		ligne = 0;
		while (grille[col-1][ligne] == 0)
		{
			ligne++;
		} // on recherche la première case vide de la colonne dans laquelle on peut mettre le jeton
		
		document.getElementById(col + "" + ligne + "").innerHTML = '<img src="images/red.png" alt="red"/>';
		grille[col-1][ligne-1] = 1;

		if ( gagnant(grille) != 0 )
		{
			partiefinie = true;
		}
		
		/*
		* --------------------------------------------------------
		* -------------------- Tour de l'IA ----------------------
		* --------------------------------------------------------
		*/
		if (!partiefinie)
		{
			var radios = document.getElementsByName('difficulty');
			for (var r = 0 ; r < radios.length ; r++)
			{
			    if (radios[r].checked)
			    {
			        difficulty = radios[r].value;
			    }
			    radios[r].disabled = true;
			}

			IA_jouer(grille, difficulty); // la profondeur donnée (coups d'avances) fait varier la difficulté, mais aussi le temps de reflexion de l'IA

			if ( gagnant(grille) != 0 )
			{
				partiefinie = true;
			}
		}

		/*
		* --------------------------------------------------------
		* ---------------- Check fin de partie -------------------
		* --------------------------------------------------------
		*/
		// console.log("Gagnant : " + gagnant(grille));

		if (!partiefinie)
		{
			nbCoups += 2;
			if (nbCoups >= 42)
			{
				unselectall();
				partiefinie = true;
				document.getElementById("message").innerHTML = "Egalité !";
			}
		}
		
		
		if (partiefinie)
		{
			unselectall();

			if ( gagnant(grille) == 1 )
			{
				document.getElementById("message").innerHTML = "Vous avez gagné !";
			}

			else if ( gagnant(grille) == 2 )
			{
				document.getElementById("message").innerHTML = "L'IA a gagné !";
			}

			else
			{
				document.getElementById("message").innerHTML = "Egalité !";
			}

			document.getElementById("replay").innerHTML = '<input type="button" value="Replay ?" onclick="replay()" />';
		}

		// DEBUG EN CONSOLE
		// var ligne = "| ";
		// for ( j=0 ; j<6 ; j++ )
		// {
		// 	for ( i=0 ; i<7 ; i++ )
		// 	{
		// 		ligne += " " + grille[i][j] + " |";
		// 	}
		// 	console.log(ligne);
		// 	ligne = "| ";
		// }
	}
}

/*
* L'IA regarde les possibilités de jeu par rapport au noeud actuel et pour chacune des possibilités, il fait 
* appel à l'algo MinMax pour déterminer quelle possibilité le mène à la feuille la plus avantageuse.
*/
function IA_jouer(grille, profondeur)
{
	var max = -10000000000000;
	var tmp, maxi, maxj;
	var col, lig;
	var valueToUse;

	for ( col=0 ; col<7 ; col++ ) // pour chaque colonne
	{
		if (grille[col][0] == 0 && !partiefinie) // si la colonne n'est pas pleine
		{
			lig = 0;
			while (grille[col][lig] == 0)
			{
				lig++;
			} // on recherche la première case vide de la colonne dans laquelle on peut mettre le jeton

			lig--; // la dernière itération de la boucle while renvoie une case en trop donc on décrémente

			grille[col][lig] = 2; // on simule le placement du jeton
			tmp = Min(grille,profondeur-1);	// c'est un noeud Min vu que l'adversaire va essayer de minimiser l'évaluation
			if ( tmp > max )
			{
				max = tmp;
				maxi = col;
				maxj = lig;
			}

			else if ( tmp == max ) // si deux branches ont la même valeur alors on choisit aléatoirement l'une d'elle (évite une quelconque répétition entre les parties)
			{
				valueToUse = Math.floor(Math.random() * 2); // choix aléatoire entre les valeurs 0 et 1
				
				// soit la branche temporaire est prise
        		if ( valueToUse == 0 )
        		{
        			max = tmp;
					maxi = col;
					maxj = lig;
        		}

        		// soit rien n'est modifié
			}

			grille[col][lig] = 0; // on revient en arrière de la simulation (à ce moment on ne sait pas si autre meilleure case sera trouvée)
		}
	}

	// console.log("Eval choisie : " + max);

	grille[maxi][maxj] = 2; // on place le jeton à l'endroit le plus favorable pour l'IA
	maxi++;
	maxj++;
	document.getElementById(maxi + "" + maxj + "").innerHTML = '<img src="images/yellow.png" alt="yellow"/>';
	
}

/*
* Reçoit une grille avec un placement de jeton simulé.
* Retourne le minimum des fils d'un noeud de l'arbre.
*/
function Min(grille, profondeur)
{
	if (profondeur == 0 || gagnant(grille)!=0)
	{
		return eval(grille); // si on est arrivé à une feuille de l'arbre, on l'évalue
	}

	var min = 10000000000000;
	var col, lig, tmp;

	for ( col=0 ; col<7 ; col++ ) // pour chaque colonne
	{
		if (grille[col][0] == 0 && !partiefinie) // si la colonne n'est pas pleine
		{
			lig = 0;
			while (grille[col][lig] == 0)
			{
				lig++;
			} // on recherche la première case vide de la colonne dans laquelle on peut mettre le jeton

			lig--; // la dernière itération de la boucle while renvoie une case en trop donc on décrémente

			grille[col][lig] = 1; // on simule le placement du jeton
			tmp = Max(grille,profondeur-1);
				
			if (tmp < min)
			{
				min = tmp;
			}

			else if ( tmp == min ) // si deux branches ont la même valeur alors on choisit aléatoirement l'une d'elle (évite une quelconque répétition entre les parties)
			{
				valueToUse = Math.floor(Math.random() * 2); // choix aléatoire entre les valeurs 0 et 1
				
				// soit la branche temporaire est prise
        		if ( valueToUse == 0 )
        		{
        			min = tmp;
        		}

        		// soit rien n'est modifié
			}

			grille[col][lig] = 0; // on revient en arrière de la simulation (à ce moment on ne sait pas si autre meilleure case sera trouvée)
		}
	}

	return min;
}

/*
* Reçoit une grille avec un placement de jeton simulé.
* Retourne le maximum des fils d'un noeud de l'arbre.
*/
function Max(grille, profondeur)
{
	if (profondeur == 0 || gagnant(grille)!=0)
	{
		return eval(grille); // si on est arrivé à une feuille de l'arbre, on l'évalue
	}

	var max = -10000000000000;
	var col, lig, tmp;

	for ( col=0 ; col<7 ; col++) // pour chaque colonne
	{
		if (grille[col][0] == 0 && !partiefinie) // si la colonne n'est pas pleine
		{
			lig = 0;
			while (grille[col][lig] == 0)
			{
				lig++;
			} // on recherche la première case vide de la colonne dans laquelle on peut mettre le jeton

			lig--; // la dernière itération de la boucle while renvoie une case en trop donc on décrémente

			grille[col][lig] = 2; // on simule le placement du jeton
			tmp = Min(grille,profondeur-1);
				
			if (tmp > max)
			{
				max = tmp;
			}

			else if ( tmp == max ) // si deux branches ont la même valeur alors on choisit aléatoirement l'une d'elle (évite une quelconque répétition entre les parties)
			{
				valueToUse = Math.floor(Math.random() * 2); // choix aléatoire entre les valeurs 0 et 1
				
				// soit la branche temporaire est prise
        		if ( valueToUse == 0 )
        		{
        			max = tmp;
        		}

        		// soit rien n'est modifié
			}

			grille[col][lig] = 0; // on revient en arrière de la simulation (à ce moment on ne sait pas si autre meilleure case sera trouvée)
		}
	}

	return max;
}

function eval(grille)
{
	// RAPPEL : 1 = humain | 2 = IA
	
	// par défaut, on est indifférent face à la grille actuelle (pas encore évaluée)
	var eval = 0;

	// on récupère les alignements (pouvant être continués) de chaque joueur
	var alignements_de_1 = alignement(grille, 1);
	var alignements_de_2 = alignement(grille, 2);
	var alignements_de_3 = alignement(grille, 3);
	var alignements_de_4 = alignement(grille, 4);

	// on définit les coefficients d'importance de chaque alignement
	var coeff_pour_1 = 1;
	var coeff_pour_2 = 10;
	var coeff_pour_3 = 10000;
	var coeff_pour_4 = 100000000;

	// on évalue la grille, le nombre de pions sert à sélectionner le chemin le plus direct (par exemple une victoire en profondeur 2 plutôt qu'en profondeur 4)
	var eval_avantageuse = coeff_pour_1*alignements_de_1[1] + coeff_pour_2*alignements_de_2[1] + coeff_pour_3*alignements_de_3[1] + coeff_pour_4*alignements_de_4[1] + countPawns(grille);
	var eval_desavantageuse = coeff_pour_1*alignements_de_1[0] + coeff_pour_2*alignements_de_2[0] + coeff_pour_3*alignements_de_3[0] + coeff_pour_4*alignements_de_4[0] + countPawns(grille);

	// l'évaluation est positive si la grille est favorable à l'IA
	// l'évaluation est négative si la grille est favorable à l'humain
	eval = eval_avantageuse - eval_desavantageuse;

	// DEBUG EN CONSOLE
	// var randomID = Math.random(); // pour départager les affichages en console
	// console.log(randomID + " : " + eval);

	return eval;
}

/*
* Compte pour chaque joueur le nombre de séries de n pions alignés (et qui peuvent être continuées pour n<4).
* Fonction au coeur de l'évaluation d'une grille.
*/
function alignement(grille, n)
{ 
	var compteur1, compteur2, c, l, joueur;
	 
	var alignements_j1 = 0;
	var alignements_j2 = 0;
	var alignements = [];

	// Verticalement
	for ( c=0 ; c<7 ; c++ )
	{
		compteur1 = 0;
		compteur2 = 0;

		for ( l=6 ; l>0 ; l-- )
		{
			if (grille[c][l] == 1)
			{
				compteur1++;
				compteur2 = 0;

				if ( n<4 && compteur1 == n && ((l - 1) > -1) ) // compteur inférieur à 4 atteint et si on ne sort pas de la grille
				{
					if (grille[c][l-1] == 0) // case suivante vide
					{
						alignements_j1++;
					}					
				}
				else if ( n==4 && compteur1 == n ) // compteur égal à 4 atteint
				{
					alignements_j1++;
				}
			}
			else if (grille[c][l] == 2)
			{
				compteur2++;
				compteur1 = 0;

				if ( n<4 && compteur2 == n && ((l - 1) > -1) ) // compteur inférieur à 4 atteint et si on ne sort pas de la grille
				{
					if (grille[c][l-1] == 0) // case suivante vide
					{
						alignements_j2++;
					}					
				}
				else if ( n==4 && compteur2 == n ) // compteur égal à 4 atteint
				{
					alignements_j2++;
				}
			}
			else
			{
				compteur2 = 0;
				compteur1 = 0;
			}
		}
	}

	// Horizontalement (on y vérifie aussi s'il y a une case libre à gauche ET à droite de l'alignement)
	for ( l=0 ; l<6 ; l++ )
	{
		compteur1 = 0;
		compteur2 = 0;

		for ( c=0 ; c<7 ; c++ )
		{
			if (grille[c][l] == 1)
			{
				compteur1++;
				compteur2 = 0;

				if ( n<4 && compteur1 == n ) // compteur inférieur à 4 atteint
				{
					if ( (c+1) < 7 ) // si on ne sort pas de la grille à la case suivante
					{
						if (grille[c+1][l] == 0 && ( grille[c+1][l+1] != 0 || (l+1) > 5 ) ) // case suivante vide et jouable (case du dessous non vide ou bas de la grille)
						{
							alignements_j1++;

							// cas de l'alignement OXO ou OOXO
							if ( (n==1 || n==2) && (c+2) < 7 ) // si on ne sort toujours pas de la grille
							{
								if (grille[c+2][l] == 1) // case après la case vide
								{
									if ( n==1 )
									{
										alignements_j1 += 9; // un alignement OXO vaut un alignement de 2 pions
									}
									if ( n==2 )
									{
										alignements_j1 += 9989; // un alignement OOXO vaut un alignement de 3 pions
									}
								}
							}
						}
					}
					if ( (c-n) > -1 ) // si on ne sort pas de la grille à la case précédente
					{
						if (grille[c-n][l] == 0 && ( grille[c-n][l+1] != 0 || (l+1) > 5 ) ) // case précédent vide et jouable (case du dessous non vide ou bas de la grille)
						{
							alignements_j1++;

							// cas de l'alignement OXO ou OXOO
							if ( (n==1 || n==2) && (c-n-1) > -1 ) // si on ne sort toujours pas de la grille
							{
								if (grille[c-n-1][l] == 1) // case avant la case vide
								{
									if ( n==1 )
									{
										alignements_j1 += 9; // un alignement OXO vaut un alignement de 2 pions
									}
									if ( n==2 )
									{
										alignements_j1 += 9989; // un alignement OXOO vaut un alignement de 3 pions
									}
								}
							}
						}
					}
				}
				else if ( n==4 && compteur1 == n ) // compteur égal à 4 atteint
				{
					alignements_j1++;
				}
			}
			else if (grille[c][l] == 2)
			{
				compteur2++;
				compteur1 = 0;

				if ( n<4 && compteur2 == n ) // compteur inférieur à 4 atteint
				{
					if ( (c+1) < 7 ) // si on ne sort pas de la grille à la case suivante
					{
						if (grille[c+1][l] == 0 && ( grille[c+1][l+1] != 0 || (l+1) > 5 ) ) // case suivante vide et jouable (case du dessous non vide ou bas de la grille)
						{
							alignements_j2++;

							// cas de l'alignement OXO ou OOXO
							if ( (n==1 || n==2) && (c+2) < 7 ) // si on ne sort toujours pas de la grille
							{
								if (grille[c+2][l] == 2) // case après la case vide
								{
									if ( n==1 )
									{
										alignements_j2 += 9; // un alignement OXO vaut un alignement de 2 pions
									}
									if ( n==2 )
									{
										alignements_j2 += 9989; // un alignement OOXO vaut un alignement de 3 pions
									}
								}
							}
						}
					}
					if ( (c-n) > -1 ) // si on ne sort pas de la grille à la case précédente
					{
						if (grille[c-n][l] == 0 && ( grille[c-n][l+1] != 0 || (l+1) > 5 ) ) // case suivante vide et jouable (case du dessous non vide ou bas de la grille)
						{
							alignements_j2++;

							// cas de l'alignement OXO ou OXOO
							if ( (n==1 || n==2) && (c-n-1) > -1 ) // si on ne sort toujours pas de la grille
							{
								if (grille[c-n-1][l] == 2) // case avant la case vide
								{
									if ( n==1 )
									{
										alignements_j2 += 9; // un alignement OXO vaut un alignement de 2 pions
									}
									if ( n==2 )
									{
										alignements_j2 += 9989; // un alignement OXOO vaut un alignement de 3 pions
									}
								}
							}
						}
					}
				}
				else if ( n==4 && compteur2 == n ) // compteur égal à 4 atteint
				{
					alignements_j2++;
				}
			}
			else
			{
				compteur2 = 0;
				compteur1 = 0;
			}
		}
	}

	// Diagonalement (on y vérifie aussi s'il y a une case libre des deux côtés de l'alignement)
	for ( joueur=1 ; joueur<=2 ; joueur++) // pour chaque joueur
	{
		for ( col=0 ; col<7 ; col++ )
		{
			for ( lig=0 ; lig<6 ; lig++ )
			{
				// Diagonale Sud Ouest au Nord Est
				// ----------------------------------------------------------------------------
				if (grille[col][lig] == joueur) // 1 pion
				{
					if (!(((lig - 1) < 0) || ((col + 1) > 6))) // si on ne sort pas de la grille
					{
						if ( n==1 ) // compteur atteint
						{
							if ( grille[col+1][lig-1] == 0 && ( grille[col+1][lig] != 0 ) ) // case suivante vide et jouable
							{
								if (joueur == 1)
								{
									alignements_j1++;

									// cas de l'alignement OXO
									if ( col+2 < 7 && lig-2 > -1 ) // si on ne sort toujours pas de la grille
									{
										if (grille[col+2][lig-2] == 1) // case après la case vide
										{
											alignements_j1 += 9; // un alignement OXO vaut un alignement de 2 pions
										}
									}
								}
								else if (joueur == 2)
								{
									alignements_j2++;

									// cas de l'alignement OXO
									if ( col+2 < 7 && lig-2 > -1 ) // si on ne sort toujours pas de la grille
									{
										if (grille[col+2][lig-2] == 2) // case après la case vide
										{
											alignements_j2 += 9; // un alignement OXO vaut un alignement de 2 pions
										}
									}
								}
							}

							if ( col-1 > -1 && lig+1 < 6 ) // si on ne sort pas de la grille à la case précédente
							{
								if ( grille[col-1][lig+1] == 0 && (grille[col-1][lig+2] != 0 || (lig+2) > 5) ) // case précédente vide et jouable
								{
									if (joueur == 1)
									{
										alignements_j1++;

										// cas de l'alignement OXO
										if ( col-2 > -1 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
										{
											if (grille[col-2][lig+2] == 1) // case après la case vide
											{
												alignements_j1 += 9; // un alignement OXO vaut un alignement de 2 pions
											}
										}
									}
									else if (joueur == 2)
									{
										alignements_j2++;

										// cas de l'alignement OXO
										if ( col-2 > -1 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
										{
											if (grille[col-2][lig+2] == 2) // case après la case vide
											{
												alignements_j2 += 9; // un alignement OXO vaut un alignement de 2 pions
											}
										}
									}
								}
							}
						}
						// ----------------------------------------------------------------------------
						if (grille[col+1][lig-1] == joueur) // 2 pions alignés
						{
							if (!(((lig - 2) < 0) || ((col + 2) > 6))) // si on ne sort pas de la grille
							{
								if ( n==2 ) // compteur atteint
								{
									if ( grille[col+2][lig-2] == 0 && ( grille[col+2][lig-1] != 0 ) ) // case suivante vide et jouable
									{
										if (joueur == 1)
										{
											alignements_j1++;

											// cas de l'alignement OOXO
											if ( col+3 < 7 && lig-3 > -1 ) // si on ne sort toujours pas de la grille
											{
												if (grille[col+3][lig-3] == 1) // case après la case vide
												{
													alignements_j1 += 9989; // un alignement OOXO vaut un alignement de 3 pions
												}
											}
										}
										else if (joueur == 2)
										{
											alignements_j2++;

											// cas de l'alignement OOXO
											if ( col+3 < 7 && lig-3 > -1 ) // si on ne sort toujours pas de la grille
											{
												if (grille[col+3][lig-3] == 2) // case après la case vide
												{
													alignements_j2 += 9989; // un alignement OOXO vaut un alignement de 3 pions
												}
											}
										}
									}

									if ( col-1 > -1 && lig+1 < 6 ) // si on ne sort pas de la grille à la case précédente
									{
										if ( grille[col-1][lig+1] == 0 && (grille[col-1][lig+2] != 0 || (lig+2) > 5) ) // case précédente vide et jouable
										{
											if (joueur == 1)
											{
												alignements_j1++;

												// cas de l'alignement OXOO
												if ( col-2 > -1 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
												{
													if (grille[col-2][lig+2] == 1) // case après la case vide
													{
														alignements_j1 += 9989; // un alignement OXOO vaut un alignement de 3 pions
													}
												}
											}
											else if (joueur == 2)
											{
												alignements_j2++;

												// cas de l'alignement OXOO
												if ( col-2 > -1 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
												{
													if (grille[col-2][lig+2] == 2) // case après la case vide
													{
														alignements_j2 += 9989; // un alignement OXOO vaut un alignement de 3 pions
													}
												}
											}
										}
									}
								}
								// ----------------------------------------------------------------------------
								if (grille[col+2][lig-2] == joueur) // 3 pions alignés
								{
									if ( !(((lig - 3) < 0) || ((col + 3) > 6)) ) // si on ne sort pas de la grille
									{
										if ( n==3 ) // compteur atteint
										{
											if ( grille[col+3][lig-3] == 0 && ( grille[col+3][lig-2] != 0 ) ) // case suivante vide et jouable
											{
												if (joueur == 1)
												{
													alignements_j1++;
												}
												else if (joueur == 2)
												{
													alignements_j2++;
												}
											}

											if ( col-1 > -1 && lig+1 < 6 ) // si on ne sort pas de la grille à la case précédente
											{
												if ( grille[col-1][lig+1] == 0 && (grille[col-1][lig+2] != 0 || (lig+2) > 5) ) // case précédente vide et jouable
												{
													if (joueur == 1)
													{
														alignements_j1++;
													}
													else if (joueur == 2)
													{
														alignements_j2++;
													}
												}
											}
										}

										else if ( n>3 ) // si on ne sort pas de la grille
										{
											if (grille[col+3][lig-3] == joueur) // 4 pions alignés
											{
												if (n == 4) // compteur atteint
												{
													if (joueur == 1)
													{
														alignements_j1++;
													}
													else if (joueur == 2)
													{
														alignements_j2++;
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}

				// Diagonale Sud Est au Nord Ouest (même méthode que pour l'autre diagonale)
				// ----------------------------------------------------------------------------
				if (grille[col][lig] == joueur)
				{
					if (!(((lig - 1) < 0) || ((col - 1) < 0)))
					{
						if ( n==1 ) // compteur atteint
						{
							if ( grille[col-1][lig-1] == 0 && ( grille[col-1][lig] != 0 ) ) // case suivante vide et jouable
							{
								if (joueur == 1)
								{
									alignements_j1++;

									// cas de l'alignement OXO
									if ( col-2 > -1 && lig-2 > -1 ) // si on ne sort toujours pas de la grille
									{
										if (grille[col-2][lig-2] == 1) // case après la case vide
										{
											alignements_j1 += 9; // un alignement OXO vaut un alignement de 2 pions
										}
									}
								}
								else if (joueur == 2)
								{
									alignements_j2++;

									// cas de l'alignement OXO
									if ( col-2 > -1 && lig-2 > -1 ) // si on ne sort toujours pas de la grille
									{
										if (grille[col-2][lig-2] == 2) // case après la case vide
										{
											alignements_j2 += 9; // un alignement OXO vaut un alignement de 2 pions
										}
									}
								}
							}

							if ( col+1 < 7 && lig+1 < 6 ) // si on ne sort pas de la grille à la case précédente
							{
								if ( grille[col+1][lig+1] == 0 && (grille[col+1][lig+2] != 0 || (lig+2) > 5) ) // case précédente vide et jouable
								{
									if (joueur == 1)
									{
										alignements_j1++;

										// cas de l'alignement OXO
										if ( col+2 < 7 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
										{
											if (grille[col+2][lig+2] == 1) // case après la case vide
											{
												alignements_j1 += 9; // un alignement OXO vaut un alignement de 2 pions
											}
										}
									}
									else if (joueur == 2)
									{
										alignements_j2++;

										// cas de l'alignement OXO
										if ( col+2 < 7 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
										{
											if (grille[col+2][lig+2] == 2) // case après la case vide
											{
												alignements_j2 += 9; // un alignement OXO vaut un alignement de 2 pions
											}
										}
									}
								}
							}
						}
						// ----------------------------------------------------------------------------
						if (grille[col-1][lig-1] == joueur)
						{
							if (!(((lig - 2) < 0) || ((col - 2)) < 0))
							{
								if ( n==2 ) // compteur atteint
								{
									if ( grille[col-2][lig-2] == 0 && ( grille[col-2][lig-1] != 0 ) ) // case suivante vide et jouable
									{
										if (joueur == 1)
										{
											alignements_j1++;

											// cas de l'alignement OOXO
											if ( col-3 > -1 && lig-3 > -1 ) // si on ne sort toujours pas de la grille
											{
												if (grille[col-3][lig-3] == 1) // case après la case vide
												{
													alignements_j1 += 9989; // un alignement OOXO vaut un alignement de 3 pions
												}
											}
										}
										else if (joueur == 2)
										{
											alignements_j2++;

											// cas de l'alignement OOXO
											if ( col-3 > -1 && lig-3 > -1 ) // si on ne sort toujours pas de la grille
											{
												if (grille[col-3][lig-3] == 2) // case après la case vide
												{
													alignements_j2 += 9989; // un alignement OOXO vaut un alignement de 3 pions
												}
											}
										}
									}

									if ( col+1 < 7 && lig+1 < 6 ) // si on ne sort pas de la grille à la case précédente
									{
										if ( grille[col+1][lig+1] == 0 && (grille[col+1][lig+2] != 0 || (lig+2) > 5) ) // case précédente vide et jouable
										{
											if (joueur == 1)
											{
												alignements_j1++;

												// cas de l'alignement OXOO
												if ( col+2 < 7 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
												{
													if (grille[col+2][lig+2] == 1) // case après la case vide
													{
														alignements_j1 += 9989; // un alignement OXOO vaut un alignement de 3 pions
													}
												}
											}
											else if (joueur == 2)
											{
												alignements_j2++;

												// cas de l'alignement OXOO
												if ( col+2 < 7 && lig+2 < 6 ) // si on ne sort toujours pas de la grille
												{
													if (grille[col+2][lig+2] == 2) // case après la case vide
													{
														alignements_j2 += 9989; // un alignement OXOO vaut un alignement de 3 pions
													}
												}
											}
										}
									}
								}
								// ----------------------------------------------------------------------------
								if (grille[col-2][lig-2] == joueur)
								{
									if ( !(((lig - 3) < 0) || ((col - 3) < 0)) )
									{
										if ( n==3 )
										{
											if (grille[col-3][lig-3] == 0 && ( grille[col-3][lig-2] != 0 ) )
											{
												if (joueur == 1)
												{
													alignements_j1++;
												}
												else if (joueur == 2)
												{
													alignements_j2++;
												}
											}

											if ( col+1 < 7 && lig+1 < 6 ) // si on ne sort pas de la grille à la case précédente
											{
												if ( grille[col+1][lig+1] == 0 && (grille[col+1][lig+2] != 0 || (lig+2) > 5) ) // case précédente vide et jouable
												{
													if (joueur == 1)
													{
														alignements_j1++;
													}
													else if (joueur == 2)
													{
														alignements_j2++;
													}
												}
											}
										}

										else if ( n>3 )
										{
											if (grille[col-3][lig-3] == joueur)
											{
												if (n == 4)
												{
													if (joueur == 1)
													{
														alignements_j1++;
													}
													else if (joueur == 2)
													{
														alignements_j2++;
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}

			}
		}
	}

	// on organise la valeur de retour en un tableau simple à deux valeurs
	alignements.push(alignements_j1);
	alignements.push(alignements_j2);

	return alignements;
}

/*
* Vérifie si la partie est gagnée par un joueur ou pas.
*/
function gagnant(grille)
{
	var i,j;
	var alignements_de_4 = alignement(grille, 4);

	if (alignements_de_4[0] > 0)
	{
		return 1; // l'humain gagne
	}
	else if (alignements_de_4[1] > 0)
	{
		return 2; // l'IA gagne
	}
	else
	{
		for ( i=0 ; i<7 ; i++ )
		{
			for ( j=0 ; j<6 ; j++ )
			{
				if (grille[i][j] == 0)
				{
					return 0; // jeu non fini
				}
			}
		}
	}

	return 3; // égalité
}

/*
* Compte le nombre de jetons dans la grille.
*/
function countPawns(grille)
{
	var cpt = 0;

	for ( i=0 ; i<7 ; i++ )
	{
		for ( j=0 ; j<6 ; j++ )
		{
			if (grille[i][j] != 0)
			{
				cpt++;
			}
		}
	}

	return cpt;
}


/*
* Relance une nouvelle partie : réinitialisation de la grille et possibilité de changer la difficulté.
*/
function replay()
{
	for ( i=1; i<=7 ; i++ )
	{
		for  ( j=1 ; j<=6 ; j++ )
		{
			grille[i-1][j-1] = 0;
			document.getElementById(i + "" + j + "").innerHTML = "";
		}
	}
	partiefinie = false;
	nbCoups = 0;

	var radios = document.getElementsByName('difficulty');
	for (var r = 0 ; r < radios.length ; r++)
	{
	    radios[r].disabled = false;
	}

	document.getElementById("replay").innerHTML = "";
	document.getElementById("message").innerHTML = "";
}

function select(col)
{
	if (!partiefinie)
	{
		for (i=1; i <= 6; i++)
		{
			document.getElementById(col + "" + i + "").style.opacity = '0.8';
		}
	}
}

function unselect(col)
{
	if (!partiefinie)
	{
		for (i=1; i <= 6; i++)
		{
			document.getElementById(col + "" + i + "").style.opacity = '1';
		}
	}
}

function unselectall()
{
	for (j = 1; j <= 7; j++)
	{
		for (i=1; i <= 6; i++)
		{
			document.getElementById(j + "" + i + "").style.opacity = '1';
		}
	}
}
