function stringSearch(littleString)
{
    var bigString = this.toString();
    var checker = false;
    for (i in bigString){
        checker = true;
        for(j in littleString){
            if(bigString.length() >= i+j && bigString[i+j] != littleString[j]){
                checker = false;
            }
        }
        if(checker == true){
            return true;
        }
    }
    return false;
}