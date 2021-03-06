/*
 * 渲染的table的id 重要，重要。渲染多个table的关键（这个留着我下次再封装吧，突然感觉还要考虑很多东西）
 * jsonData:数据（这里是使用的固定数据，因为ajax本地跨域的问题，所以没有使用ajax传递数据，项目中，需根据实际环境做出调整）
 * 每页展示的数据条数,默认为5 可填写的格式为，number true(为默认)
 * 可修改的每页展示条数，默认为[5,10,20];，填写格式为 array true(为默认)
 * 是否添加翻页选中效果 此处使用了set集合的形式，避免重合，所以请使用唯一标识来区别 true 默认打开，false 关闭
 * */
function tableInit(result,dataNum,pages,setOpen){
    setOn=setOpen;
    if(!dataNum){
        alert("请填写正确的每页展示产品格式！code(1)")
    }else{
        if(typeof dataNum === "number"){
            tableNum=dataNum;
        }
    }
    if(result.status){
        if(result.data){
            if(result.data.length <= 0){
                return false;
            }
            $(".reminder").remove();
            backupAataArray=result.data;
            dataTotalNum=backupAataArray.length;
            if(backupAataArray.length>tableNum){
                filtrateTable=backupAataArray.slice(0,tableNum);
            }else{
                filtrateTable=backupAataArray.slice(0);
            }
        }
    }
    if(pages){
        if(pages.length>0){
            for(let i in pages){
                let optionPage=$('<option ' + (pages[i] === tableNum ? 'selected=“selected"' : '') + ' value="'+pages[i]+'">'+pages[i]+'</option>');
                $(".tablesLength").append(optionPage);
            }
        }else{
            let pages=pagesChoose;
            for(let i in pages){
                let optionPage=$('<option ' + (pages[i] === tableNum ? 'selected=“selected"' : '') + ' value="'+pages[i]+'">'+pages[i]+'</option>');
                $(".tablesLength").append(optionPage);
            }
        }
    }

    tableCreate();
    /*创建页码*/
    createPages();
}
/*)*/

//连接跳转
function href(node) {
   let tr = node.parent().parent();
   let trFactory = tr.children().eq(0).text();
   let trId = node.text();
   let trName = tr.children().eq(2).text();

   window.location.assign("./keys.html?factory=" + trFactory + "&id=" + trId + "&name=" + trName);
}

//取消修改产品
function cancleOperat(node) {
    let td = node.parent().parent();
    let vals = td.attr("_val");

    let txtHtml = td.attr("_id") === "1" ? $("<span onclick='href($(this))'>" + vals + "</span>") : vals;
    td.empty()
    td.append(txtHtml);

    td.parent().removeClass("changing");
}

//修改产品
function changeDatas(td, type){
    let vals = td.text();

    if(checkOperat(td.parent().parent().children())){return ;}
    //加上标示
    td.parent().addClass("changing");
    if(type === "id"){td.attr("_id", 1)}
    td.attr("_val", vals);
    td.empty();
    td.append($("<div class='ui input'><input id='changeInp' autofocus type='text' value='" + vals + "'/></div>"));

    //修改产品的开关
    $("#changeInp").bind("keypress", function (ev) {
        if(ev.which === 13){
            changeProduct(td, type, vals);
            td.parent().removeClass("changing");
        }
    });
}

/*创建table数据*/
function tableCreate(){
    let flag = path.indexOf("keys") !== -1;
    $("#userImportTable>tbody").html("");
    $("#userImportAllTd>input").prop("checked", false);

    /*创建table里面的数据结构 td的各项值 S*/
    for(let i in filtrateTable){
        let trHtml=$("<tr>"+
            "<td " + (flag ? "" : "style='cursor: pointer' ondblclick='changeDatas($(this), \"factory\")'") + ">"+(filtrateTable[i].factory || '空')+"</td>"+
            "<td " + (flag ? "" : "style='cursor: pointer' ondblclick='changeDatas($(this), \"id\")'") + "><span onclick='href($(this))'>"+filtrateTable[i].id+"</span></td>"+
            "<td " + (flag ? "" : "style='cursor: pointer' ondblclick='changeDatas($(this), \"name\")'") + ">"+filtrateTable[i].name+"</td>"+
            "<td " + (flag ? "" : "style='cursor: pointer' ondblclick='changeDatas($(this), \"first\")'") + ">"+((flag ? filtrateTable[i].key : filtrateTable[i].first)||(flag ? '空' : 0)) +"</td>"+
            "<td>"+((flag ? filtrateTable[i].operat : filtrateTable[i].now)||0)+"</td>"+
            "<td>"+((flag ? filtrateTable[i].num : filtrateTable[i].in)||0)+"</td>"+
            "<td>"+((flag ? filtrateTable[i].date : filtrateTable[i].out)||0)+"</td>"+
            (flag ? "" : "<td><button class='checkBtn showModal'>入库</button>" +
            "<button " + (filtrateTable[i].now <= 0 ? "disabled='disabled'" : "") + " class='checkBtn showModal ml'>领料</button></td>") +
        "</tr>");
        //按照集合内容判断现选中的input 翻页保留选中效果
        if(setOn){
            let checkedTdId=trHtml.find(".ceckedImportTd>input").val();
            let checkedFlg="";
            if(dataSet.has(checkedTdId)){
                checkedFlg="checked";
                trHtml.find(".ceckedImportTd>input").prop("checked", true);
            }
        }else{
            dataSet.clear();
            chooseDataNm();
        }

        /*自定义td内容 E*/
        /*添加tr内容到table tbody 中*/
        $("#userImportTable>tbody").append(trHtml);
    }
    /*创建table里面的数据结构 td的各项值 E*/
    /*判断是否当页全选*/
    if($(".ceckedImportTd>input:checked").length===$(".ceckedImportTd>input").length){
        //已全选
        $("#userImportAllTd>input").prop("checked", true);
    }
    /*做单选和多选部分*/
    /*单选效果*/
    $(".ceckedImportTd,.ceckedImportTd>input").bind("click",function(e){
        if(e.target.nodeName.toUpperCase() === 'INPUT'){
            if($("input[name='ceckedImport']").length === $("input[name='ceckedImport']:checked").length){
                $("#userImportAllTd>input").prop("checked",true);
            }else{
                $("#userImportAllTd>input").prop("checked",false);
            }
            if(this.checked){
                dataSet.add($(this).val());
            }else{
                dataSet.delete($(this).val());
            }
            chooseDataNm();
            e.stopPropagation();
        }else{
            let ch = $(this).find('input').prop('checked');
            if(ch === false){
                $(this).find('input').prop('checked',true);
                if($("input[name='ceckedImport']").length === $("input[name='ceckedImport']:checked").length){
                    $("#userImportAllTd>input").prop('checked',true);
                }else{
                    $("#userImportAllTd>input").prop('checked',false);
                }
                dataSet.add($(this).find('input').val());
            }else{
                $(this).find('input').prop('checked',false);
                if($("input[name='ceckedImport']").length === $("input[name='ceckedImport']:checked").length){
                    $("#userImportAllTd>input").prop('checked',true);
                }else{
                    $("#userImportAllTd>input").prop('checked',false);
                }
                dataSet.delete($(this).find('input').val());
            }
            chooseDataNm();
        }
    });

    /*全选部分*/
    $("#userImportAllTd,#userImportAllTd>input").click(function(e){
        if(e.target.nodeName.toUpperCase() === 'INPUT'){
            console.log("cccccccccccccc");
            $("input[name='ceckedImport']").prop("checked",this.checked);
            if(this.checked){
                $("input[name='ceckedImport']").each(function(index, input) {
                    dataSet.add($(input).val());
                })
            }else{
                $("input[name='ceckedImport']").each(function(index, input) {
                    dataSet.delete($(input).val());
                })
            }
            chooseDataNm();
            e.stopPropagation();
        }else{
            let ch = $(this).find('input').prop('checked');
            if(ch === false){
                $(this).find('input').prop('checked',true);
                $("input[name='ceckedImport']").prop("checked",true);

                $("input[name='ceckedImport']").each(function(index, input) {
                    dataSet.add($(input).val());
              })
            }else{
                $(this).find('input').prop('checked',false);
                $("input[name='ceckedImport']").prop("checked",false);
                $("input[name='ceckedImport']").each(function(index, input) {
                    dataSet.delete($(input).val());
                })
            }
            chooseDataNm();
        }

    });

    //每次都要加载弹框方法
    if(!flag){
        loadModal();
    }
}

/*创建翻页*/
function createPages(){
    /*批量导入用户翻页效果  需要实际数据支持*/
    let pagesNum=Math.ceil(dataTotalNum/tableNum);//计算总页码数
    $(".tablePageinate").html("");
    let pagesButtons=$('<a class="pageinateBtn previous disabled" aria-controls="userImportTable" pageId="0" tabindex="0" previousPage="0" id="pagePrevious">&lt;</a>'+
                        '<span class="pageBtnS">'+
                        '</span>'+
                    '<a class="pageinateBtn next" aria-controls="userImportTable" pageId="2" tabindex="0" nextPage="'+pagesNum+'" id="pageNext">&gt;</a>')
    $(".tablePageinate").append(pagesButtons);
    if(pagesNum<=0){
        return false;
    }
    let detailPage=$('<a class="pageinateBtn current" aria-controls="userImportTable" pageId="1" tabindex="0">1</a>');
    $(".tablePageinate").find(".pageBtnS").append(detailPage);


    //初始化页码，包括当页码是在标准页码pageFixedNum之内的页码数，包括产生省略号的页码效果
    if(pagesNum>=2&&pagesNum<=pageFixedNum){
        for(let num =2;num <= pagesNum;num++){
            let detailPages=$('<a class="pageinateBtn " aria-controls="userImportTable" pageId="'+num+'" tabindex="0">'+num+'</ a>');
            $(".tablePageinate").find(".pageBtnS").append(detailPages);
        }
    }
    if(pagesNum>pageFixedNum){
        let previousEllipsis=$('<span class="previousEllipsis" hidden="hidden">...</span>');
        $(".tablePageinate").find(".pageBtnS").append(previousEllipsis);
        for(let num =2;num <= pageFixedNum-1;num++){
            let detailPages=$('<a class="pageinateBtn " aria-controls="userImportTable" pageId="'+num+'" tabindex="0">'+num+'</ a>');
            $(".tablePageinate").find(".pageBtnS").append(detailPages);
        }
        for(let num= pageFixedNum;num< pagesNum;num++){

            let detailPages=$('<a class="pageinateBtn" aria-controls="userImportTable" pageId="'+num+'" tabindex="0" style="display:none">'+num+'</ a>');
            $(".tablePageinate").find(".pageBtnS").append(detailPages);
        }
        let nextEllipsis=$('<span class="nextEllipsis">...</span>');
        $(".tablePageinate").find(".pageBtnS").append(nextEllipsis);
        let detailPages=$('<a class="pageinateBtn" aria-controls="userImportTable" pageId="'+pagesNum+'" tabindex="0" >'+pagesNum+'</ a>');
        $(".tablePageinate").find(".pageBtnS").append(detailPages);
    };


    /*翻页效果*/
    /*前翻页*/
    $("#pagePrevious").bind("click",function(){
        let pageNum=parseInt($(this).attr("pageId"));
        /*前翻页禁用效果*/
        if(pageNum<=0){
            $(this).addClass("disabled");
            return false;
        }
        if(pageNum>0){
            currentPageNum=pageNum;
            pageNum--;
            $("#pageNext").attr("pageId",pageNum+2).removeClass("disabled");
            $(this).attr("pageId",pageNum);
            $(".pageBtnS>a").eq(pageNum).addClass("current").siblings().removeClass("current");
            /*获取分页数据*/
            filtrateTable=backupAataArray.slice((currentPageNum-1)*tableNum,currentPageNum*tableNum);
            tableCreate();

        }


        /*前翻页适当保留6位页码数，前省略点的消失和后省略点的出现的情况*/
        if($(".pageBtnS>a").eq(pageNum-1).css("display")==="none" && $(".pageBtnS>a").eq(pageNum-2).css("display")==="none"){
            $(".pageBtnS>a").eq(pageNum-1).css("display","inline-block")
        }
        if(pageNum<3){
            $(".previousEllipsis").hide();
            $(".nextEllipsis").show();

            for(let i = 1;i<4;i++){
                $(".pageBtnS>a").eq(i).css("display","inline-block");
            }
            for(let i =2;i<pagesNum-3;i++){
                $(".pageBtnS>a").eq(pagesNum-i).css("display","none");
            }
            return false;
        }
        if(pagesNum-pageNum>3){
            $(".nextEllipsis").show();
            for(let i = pageNum+1;i<pagesNum-2;i++){
                $(".pageBtnS>a").eq(i+1).css("display","none");
            }
        }
    })
    /*后翻页*/
    $("#pageNext").bind("click",function(){
        let pageNum=parseInt($(this).attr("pageId"));
        if(pageNum>pagesNum){
            $(this).addClass("disabled");
            return;
        }
        if(pageNum<pagesNum+1){
            $("#pagePrevious").attr("pageId",pageNum-1).removeClass("disabled");
            currentPageNum=pageNum;
            pageNum++;
            $(this).attr("pageId",pageNum);
            $(".pageBtnS>a").remove("current");
            $(".pageBtnS>a").eq(pageNum-2).addClass("current").siblings().removeClass("current");

        }

        /*翻页效果产生省略号的延续效果*/
        /*翻页数据修改*/
        /*判断当前页数数据是否为5条满数据，分别的截取方法*/

        if(currentPageNum*tableNum>dataTotalNum){
            filtrateTable=backupAataArray.slice((currentPageNum-1)*tableNum);
        }else{
            filtrateTable=backupAataArray.slice((currentPageNum-1)*tableNum,currentPageNum*tableNum);
        }
        tableCreate();



        /*后翻页的时候 适当保留后五位页码显示，此时后省略号消失。控制前省略号的显示情况，当页码显示数量超过6时，即可产生前省略号*/
        if($(".pageBtnS>a").eq(pageNum-1).css("display")==="none" && $(".pageBtnS>a").eq(pageNum).css("display")==="none"){
            $(".pageBtnS>a").eq(pageNum-1).css("display","inline-block");
        }
        if(pagesNum-pageNum<2){
            $(".nextEllipsis").hide();
            $(".previousEllipsis").show();
            for(let i = 1;i<5;i++){
                $(".pageBtnS>a").eq(pagesNum-i).css("display","inline-block");
            }
            for(let i =1;i<pagesNum-5;i++){
                $(".pageBtnS>a").eq(i).css("display","none");
            }
            return false;
        }
        if(pageNum>=5){
            $(".previousEllipsis").show();
            for(let i=1;i<pageNum-3;i++){
                $(".pageBtnS>a").eq(i).css("display","none");
            }
        }
    })
    /*自选页码点击翻页事件*/
    $(".pageBtnS .pageinateBtn").bind("click",function(){
        let currentPageNum=parseInt($(this).attr("pageId"));
        /*控制前省略号显示事件，页码在5和倒数第3时触发事件*/
        if(currentPageNum<=3){
            $(".previousEllipsis").hide();
            $(".nextEllipsis").show();
            for(let i =1;i<4;i++){
                $(".pageBtnS>a").eq(i).css("display","inline-block");
            }
            for(let j=4;j<pagesNum-2;j++){
                $(".pageBtnS>a").eq(j).css("display","none");
            }
        }
        /*前后翻页省略*/
        if(currentPageNum>3&&pagesNum-currentPageNum>=3){
            $(".previousEllipsis").show();
            $(".nextEllipsis").show();

            for(let j=1;j<pagesNum-1;j++){
                $(".pageBtnS>a").eq(j).css("display","none");
            }
            for(let i = currentPageNum  - 2; i < currentPageNum + 1; i++){
                $(".pageBtnS>a").eq(i).css("display","inline-block");
            }
        }
        /*后翻省略*/
        if(pagesNum-currentPageNum<4){
            $(".nextEllipsis").hide();
            $(".previousEllipsis").show();
            for(let i =1;i<6;i++){
                $(".pageBtnS>a").eq(pagesNum-i).css("display","inline-block");
            }
            for(let j=1;j<pagesNum-5;j++){
                $(".pageBtnS>a").eq(j).css("display","none");
            }
        }


        $(".pageBtnS>a").eq(currentPageNum-1).addClass("current").siblings().removeClass("current");
        if(currentPageNum*tableNum>dataTotalNum){
            filtrateTable=backupAataArray.slice((currentPageNum-1)*tableNum);
        }else{
            filtrateTable=backupAataArray.slice((currentPageNum-1)*tableNum,currentPageNum*tableNum);
        }
        $("#pagePrevious").attr("pageId",currentPageNum-1);
        $("#pageNext").attr("pageId",currentPageNum+1);
        if(currentPageNum-1>0){
            $("#pagePrevious").removeClass("disabled");
        }
        if(currentPageNum+1<pagesNum){
            $("#pageNext").removeClass("disabled");
        }
        tableCreate();
    })

}


/*已选多少项目*/
function chooseDataNm(){
    $(".selectedNumImport").html(Array.from(dataSet).length);
}
/*设置每页显示的条数S*/
function changePages(pageNum){
    tableNum=pageNum;
    if(backupAataArray.length>tableNum){
        filtrateTable=backupAataArray.slice(0,tableNum);
    }else{
        filtrateTable=backupAataArray.slice(0);
    }
    if(getDatas("changeTableNum?tableNum=" + tableNum) === null){alert("获取数据失败!code(11)"); return}
    tableCreate();
    createPages();
}

//取消输入
function cancle(node) {
    let tbody = document.getElementById("userImportTable").getElementsByTagName("tbody")[0];
    let tr = node.parentNode.parentNode;
    tbody.removeChild(tr);
}

//检查是否有操作
function checkOperat(node) {
    if(node.hasClass("adding") || node.hasClass("changing")){
        alert("正在添加或修改产品, 无法切换操作!");
        return true;
    }
}

//获取当前点击数量极其下标 展示获取的数据
function addDatas(){
    let trs = $("#userImportTable tbody tr");

    if(checkOperat(trs)){return ;}
    let trHtml=$("<tr class='adding'>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><div class='ui input'><input type='text' placeholder='请输入...'></div></td>"+
        "<td><button class='checkBtn' onclick='checkAddDatas(this)'>确定</button>" +
        "<button class='checkBtn ml' onclick='cancle(this)'>取消</button></td>"+
    "</tr>");
    $("#userImportTable>tbody").append(trHtml);
}

//删除产品的操作
function deleteDatas(node) {
    let tds = node.parent().parent().children();
    let thisFactory = tds.eq(0).text();
    let thisId = tds.eq(1).text();
    let thisName = tds.eq(2).text();

    sure = confirm("确认要删除\n厂家: {0}, 型号: {1}, 名称: {2}\n此产品吗!".replace("{0}", thisFactory).replace("{1}", thisId).replace("{2}", thisName));
    if(!sure){return}

    let origin = {"factory": thisFactory, "id": thisId, "name": thisName};
    if(getDatas("deleteData?origin=" + JSON.stringify(origin)) === null){alert("删除产品失败!"); return}
    location.reload();
}

//改变操作按钮
function operatToggle() {
    let trs = $("#userImportTable tbody tr");

    if(checkOperat(trs)){return ;}
    for(let i = 0; i < trs.length; i++){
        let optd = trs.eq(i).children().eq(-1);//操作栏的td

        if(optd.children().length === 2){
            optd.empty();
            optd.append($("<button class='checkBtn delBtn' onclick='deleteDatas($(this))'>删除</button>"));
        }else{
            optd.empty();
            let txtHmlt = $("<button class='checkBtn showModal'>入库</button>" +
                "<button" + (filtrateTable[i].now <= 0 ? " disabled='disabled'" : "") + " class='checkBtn showModal ml'>领料</button>");
            optd.append(txtHmlt);

            //加载弹窗
            loadModal();
        }
    }
}