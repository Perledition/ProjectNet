import os
import re
from functools import reduce

import pandas as pd

to_ignore = ['.git', '__pycache__', '.DS_Store']


def get_directory_structure(rootdir):
    """
    Creates a nested dictionary that represents the folder structure of rootdir
    """
    dir = {}
    rootdir = rootdir.rstrip(os.sep)
    start = rootdir.rfind(os.sep) + 1
    for path, dirs, files in os.walk(rootdir):
        folders = path[start:].split(os.sep)
        subdir = dict.fromkeys(files)
        parent = reduce(dict.get, folders[:-1], dir)
        parent[folders[-1]] = subdir

    return dir


def file_identification(file_list, root, types):
    result_list = list()
    for file in file_list:
        try:
            if file.split('.')[-1] in types:
                result_list.append(root + '/' + file)
        except IndexError:
            pass
    return result_list


# print(get_directory_structure('/Users/maximperl/PycharmProjects/Privat/DarkArts'))
def all_files(path):
    file_types = ['py', 'js', 'css', 'svg', 'png', 'jpeg', 'pyc', 'html']
    file_paths = list()
    for root, dirs, files in os.walk(path):
        files = [file for file in files if file not in to_ignore]
        files = file_identification(files, root, file_types)

        file_paths += files
    return file_paths


def value_check(list1, list2):
    if set(list1) & set(list2):
        return True
    else:
        return False


def filter_string(function_string, function_type):
    results = list()
    for ft in function_type:
        func_regex = re.findall(r"{} [a-zA-Z0-9_]+".format(ft), function_string)
        if len(func_regex) > 0:
            results += [x.replace(ft + ' ', '') for x in func_regex]
    return ','.join(func for func in results)


def create_corpus_data(files):
    file_data = {'file': list(), 'import': list(), 'function': list()}

    for file in files:
        with open(file, 'r') as f:
            try:
                corpus = f.read().split('\n')
                imports = [' '.join(x for x in corpus if value_check(x.split(' '), ['import']))]
                functions = [' '.join(x for x in corpus if value_check(x.split(' '), ['class', 'def']))]

                file_data['file'] += [file.split('/')[-1]]
                file_data['import'] += [filter_string(import_value, ['import']) for import_value in imports]
                file_data['function'] += [filter_string(import_value, ['def', 'class']) for import_value in functions]

            except UnicodeDecodeError or AttributeError:
                pass

    return file_data


def project_to_data(files):
    return pd.DataFrame(create_corpus_data(files))


def identify_connections(df):
    dependencies = list()
    for row in df.iterrows():
        row_dependencie = list()
        import_list = row[1]['import'].split(',')

        for file_row in df.iterrows():
            if set(file_row[1]['function'].split(',')) & set(import_list):
                row_dependencie.append(file_row[1]['file'])

        dependencies.append(','.join(dep for dep in row_dependencie))

    return dependencies


def create_link(source, target):
    return {"source": source, "target": target, "type": "suit"}


def dependencie_links(df):
    links = list()
    for row in df.iterrows():
        influencer = row[1].dependencie.split(',')
        for influence in influencer:
            if influence != '':
                links.append(create_link(influence, row[1].file))

    return links