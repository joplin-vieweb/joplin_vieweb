function joplinvw_onload() {
    clear_note();
    get_notebooks_from_server();
    get_tags_from_server();
}

function display_progress(item) {
    item.addClass("center");
    item.html(' <span class="helper_vertical_align"></span><img style="height: 32px;" src="/static/joplinvieweb/img/progress.gif" />');
}

function clear_progress(item) {
    item.html('');
    item.removeClass("center");
}

function clear_note() {
    $("#note_view").removeClass("border_note");
    $("#note_view").html("");
    $(".note_view_header").html("...");
}

function display_notebooks_tree(data) {
    clear_progress($("#notebooks_tree_inner"));
    $('#notebooks_tree_inner').tree({
        data: data,
        autoOpen: 1,
        autoEscape: false,
        closedIcon: $('<span class="icon-arrow-circle-right"></span>'),
        openedIcon: $('<span class="icon-arrow-circle-down"></span>')
    });
    
    // prevent unselection of notebook:
    $('#notebooks_tree_inner').bind(
        'tree.click',
        function(e) {
            if ($('#notebooks_tree_inner').tree('isNodeSelected', e.node)) {
                e.preventDefault();
            }
        }
    );
}

function get_notebooks_from_server() {
    display_progress($("#notebooks_tree_inner"));
    $.getJSON(
    '/joplin/notebooks/',
    display_notebooks_tree
    )  .fail(function() {
        clear_progress($("#notebooks_tree_inner"));
        console.log("error while getting notebooks ");
        $.get(
        '/joplin/notebooks_error/',
        function(data) {$("#notebooks_tree_inner").html(data);}
        )
  });
}

function display_tags(data) {
    clear_progress($("#tags"));
    $("#tags").html(data);
}

function get_tags_from_server() {
    display_progress($("#tags"));
    $.get(
    '/joplin/tags/',
    display_tags
    )  .fail(function() {
        clear_progress($("#tags"));
        console.log("error while getting tags ");
        $.get(
        '/joplin/tags_error/',
        function(data) {$("#tags").html(data);}
        )
  });
}

function display_notebook_notes(data) {
    clear_progress($("#notes_list"));
    $("#notes_list").html(data);
}

function display_notebook(nb_id) {
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

function display_note_body(data, note_name) {
    clear_progress($("#note_view"));
    $(".note_view_header").html(note_name);
    $("#note_view").html(data);
    $("#note_view").addClass("border_note");
    if ($("#note_view").find(".toc").html().includes("li") == false) {
        $("#note_view").find(".toc").remove();
    }
    else {
        $("#note_view").find(".toc").append('<div class="toc_ctrl"><span onclick="toggle_toc(this);" class="icon-chevron-circle-down"></span> <span onclick="$(\'.toc\').remove();" class="icon-times-circle"></span>&nbsp;</div>')
    }
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
    
    $(".toc ul").fadeToggle();
}

function display_note(note_id, note_name) {
    clear_note();
    $(".note_item").removeClass("selected");
    $("#note_item_"+note_id).addClass("selected");
    display_progress($("#note_view"));
    
    $.get(
    '/joplin/notes/' + note_id + "/",
    function(data) { display_note_body(data, note_name); }
    )  .fail(function() {
        clear_progress($("#note_view"));
        console.log("error while getting note " + note_id );
        $.get(
            '/joplin/note/' + note_id + "/error/" + encodeURIComponent(note_name),
            function(data) {display_note_error(data, note_name);}
        )
  });
}