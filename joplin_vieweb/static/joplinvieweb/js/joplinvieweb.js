class JoplinVieweb {
    constructor() {
        this.note_view = new NoteView();
        this.side_bar = new SideBar();
        
        this.side_bar.on("notebook_selected", function(notebook_id) { alert(notebook_id); });
    }
    
    init() {
        this.note_view.clear();
        this.side_bar.init();
    }
}

var app = new JoplinVieweb();

$(window).on("load" , function() { app.init(); } );



function clear_selected_nb_tag(){
    $(".jqtree-selected").removeClass("jqtree-selected");
    clear_selected_tags();
}

function display_tag_from_click(item, tag_id) {
    clear_selected_nb_tag();
    $(item).addClass("selected");
    display_tag(tag_id);
}

function display_tag(tag_id) {
    clear_note();
    display_progress($("#notes_list"));
    
    $.get(
    '/joplin/tags/' + tag_id + "/notes",
    display_notebook_notes
    )  .fail(function() {
        clear_progress($("#notes_list"));
        console.log("error while getting notes of tag " + tag_id);
        $.get(
        '/joplin/tag_error/' + tag_id,
        function(data) {$("#notes_list").html(data);}
        )
  });    
}

function clear_selected_tags() {
    $(".tag_item").removeClass("selected");
}

function clear_note() {
    $("#note_view").removeClass("border_note");
    $("#note_view").html("");
    $(".note_view_header").html("...");
}

function display_notebook_notes(data) {
    clear_progress($("#notes_list"));
    $("#notes_list").html(data);
}

function display_notebook(nb_id) {
    clear_selected_nb_tag();
    clear_note();
    display_progress($("#notes_list"));
    $.get(
    '/joplin/notebooks/' + nb_id + "/",
    display_notebook_notes
    )  .fail(function() {
        clear_progress($("#notes_list"));
        console.log("error while getting notes of notebook " + nb_id );
        $.get(
        '/joplin/notebooks/' + nb_id + "/error/",
        function(data) {$("#notes_list").html(data);}
        )
  });
}

function display_note_tags(data) {
    $("#note_view").prepend(data);
}

function display_note_body(data, note_name, note_id) {
    $.get(
        '/joplin/notes/' + note_id + "/tags",
        display_note_tags
    ) ;
    
    clear_progress($("#note_view"));
    $(".note_view_header").html(note_name);
    $("#note_view").html(data);
    $("#note_view").addClass("border_note");
    if ($("#note_view").find(".toc").html().includes("li") == false) {
        $("#note_view").find(".toc").remove();
    }
    else {
        $("#note_view").find(".toc").append('<div class="toc_ctrl"><span onclick="toggle_toc(this);" class="icon-chevron-circle-down"></span> <span onclick="$(\'.toc\').remove();" class="icon-times-circle"></span>&nbsp;</div>');
        $("#note_view").find(".toc").prepend('<center style="display: none;" id="toc_title">Content</center>');
        note_view_position = $('#note_view').position();
        $(".toc").css("top", "calc(" + note_view_position.top.toString() + "px + 0.8em + 17px)");
        $(".toc").css("right", "20px");
    }
    
    $('.toc').draggabilly({});
}

function display_note_error(data, note_name) {
    clear_progress($("#note_view"));
    $(".note_view_header").html(note_name);
    $("#note_view").html(data);
    $("#note_view").addClass("border_note");
}

function toggle_toc(item_toggle) {
    $(item_toggle).toggleClass("icon-chevron-circle-down");
    $(item_toggle).toggleClass("icon-chevron-circle-right");
    
    state = $("#toc_title").css("display");
    if (state == "none") {
        $(".toc>ul").fadeToggle(function() {$("#toc_title").fadeToggle();});
    }
    else {
        $("#toc_title").fadeToggle(function() {$(".toc>ul").fadeToggle();});
    }
}

function display_note(note_id, note_name) {
    clear_note();
    $(".note_item").removeClass("selected");
    $("#note_item_"+note_id).addClass("selected");
    display_progress($("#note_view"));
    
    $.get(
    '/joplin/notes/' + note_id + "/",
    function(data) { display_note_body(data, note_name, note_id); }
    )  .fail(function() {
        clear_progress($("#note_view"));
        console.log("error while getting note " + note_id );
        $.get(
            '/joplin/note/' + note_id + "/error/" + encodeURIComponent(note_name),
            function(data) {display_note_error(data, note_name);}
        )
  });  
}