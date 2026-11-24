/** Glosar scurt pentru componenta <Term>. */
export const glossary: Record<string, string> = {
  pixel: 'Cel mai mic punct dintr-o imagine digitală. Are trei numere (roșu, verde, albastru), fiecare între 0 și 255.',
  luminanta: 'Cât de luminos pare un pixel, calculat ca 0,299·R + 0,587·G + 0,114·B. Ochiul vede verdele mai luminos decât albastrul.',
  prag: 'Un număr care împarte valorile în două grupe: peste prag înseamnă „da”, sub prag înseamnă „nu”.',
  kernel: 'Un tabel mic de numere (de exemplu 3×3) cu care „cântărim” vecinătatea unui pixel ca să obținem noua lui valoare.',
  histograma: 'Un grafic care arată câți pixeli au fiecare nivel de luminozitate, de la 0 (negru) la 255 (alb).',
  zgomot: 'Variații aleatoare ale pixelilor, de exemplu grăuntele din pozele făcute pe întuneric.',
  mse: 'Eroarea pătratică medie: media pătratelor diferențelor dintre două imagini. Mai mic înseamnă mai asemănător.',
  snr: 'Raportul semnal/zgomot, în decibeli. Mai mare înseamnă imagine mai curată.',
}
